import { bus } from './index.js';
import editComp from './edit.js'

export default {
    name: 'home',
    components: editComp,
    data() {
        return{
            currentStory: -1,
            currentList:"",
            privateStoriesList: [],
            publicStoriesList: []
        }
    },
    template: `
        <div id="storySection" class="container-fluid">
            <p class="info">Storie pubblicate</p>
            <div id="publicStories">
                <span v-if="publicStoriesList.length == 0">Nessuna storia pubblicata</span>
                <div id="public-list" class="list-group" v-else>
                    <button v-for="(story,index) in publicStoriesList" :key="index" type="button" class="list-group-item list-group-item-action" @click="changeActive(index,'public')">
                        {{story}} 
                        <span class="icon-group">
                            <i tabindex="0" class="fas fa-file-download" @click="downloadStory(event,index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-qrcode" @click="createQRCode(event, index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-trash-alt" data-toggle="modal" data-target="#deleteModal"></i>
                        </span>
                        <div class="content" style="display:none"></div>
                    </button>
                </div>
            </div>
            <p class="info">Seleziona la storia che vuoi modificare,copiare,eliminare o pubblicare.</p>
            <div id="littleMenu">
                <button @click="newStory">Nuova storia <i class="fas fa-plus"></i></button>
            </div>
            <div id="privateStories">
                <span v-if="privateStoriesList.length == 0">Nessuna storia presente</span>
                <div id="private-list" class="list-group" v-else>
                    <button v-for="(story,index) in privateStoriesList" :key="index" type="button" class="list-group-item list-group-item-action " @click="changeActive(index,'private')">
                        {{story}} 
                        <span class="icon-group">
                            <i tabindex="0" class="fas fa-edit" @click="editStory(event, index)" ></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-copy"  @click="duplicateStory(event,index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-file-upload" @click="loadStory(event,index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-trash-alt" data-toggle="modal" data-target="#deleteModal"></i>
                        </span>
                        <div class="content" style="display:none"></div>
                    </button>
                </div>
            </div>
            <div id="qrcodeMenu">
                <div id="qrcode"></div>
                <p></p>
                <button @click="hideMenu">CHIUDI FINESTRA</button>
            </div>
            <!-- Modal for confirming the elimination -->
            <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" >Avviso eliminazione</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Se elimini questo file lo perderai in maniera definitiva.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" @click="deleteStory(event,currentStory)">Elimina</button>
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    `,
    methods: {
        //ogni volta che clicco su un bottone per svolgere attività sulla storia viene eseguita anche questa perchè i bottoni piccoli sono dentro
        //a quello grande, in questa maniera so da quale storia è stato premuto il bottone per eseguire modifiche
        changeActive(index,list){
            this.currentStory = index;
            this.currentList = list;
            let current = list + '-list';
            let title;
            if(list == 'private'){
                title = this.privateStoriesList[index];
            } else title = this.publicStoriesList[index];
            if($(`#${current} div:eq(${index})`).css("display") == "block")
                $(`#${current} div:eq(${index})`).css("display", "none");
            else {
                $.ajax({
                    url: '/getStory?title='+title+'&group='+list,
                    type: 'GET',
                    success: (data) =>{    
                        console.log(JSON.stringify(data,null,2));                   
                        $(`#${current} div:eq(${index})`).html("<hr><pre>"+JSON.stringify(data,null,2)+"</pre>");
                        $(`#${current} div:eq(${index})`).css("display", "block");
      
                    },
                    error: () =>{
                        console.log('error')
                    }
                });
            }
        },
        newStory(){
            $('.content').css("display", "none");
            $('#toEditMenu').click(); 
            const promise = new Promise((succ, err) => {
                bus.$on('ready',(msg) => {
                    console.log(msg);
                    succ('ok');
                });
            });
            
            promise.then(() => {
                console.log('emit');
                bus.$emit('story','');
                bus.$emit('titles', {privateList:this.privateStoriesList,publicList:this.publicStoriesList});
            }); 
        },
        loadStory(event, index) {
            event.stopPropagation();
                $.ajax({
                    url: '/publicStory/' + this.privateStoriesList[index],
                    type: 'PUT',
                    success: (response) =>{
                       console.log("Storia resa pubblica");
                       this.publicStoriesList.push(this.privateStoriesList[index]);
                       this.privateStoriesList.splice(index,1);
                    },
                    error: function (e) {
                        console.log('error');
                    }
                 });        
            
        },
        downloadStory(event,index) {
            event.stopPropagation();
            $.ajax({
                url: '/privateStory/' + this.publicStoriesList[index],
                type: 'PUT',
                success: (response) =>{
                   console.log("Storia resa privata");
                   this.privateStoriesList.push(this.publicStoriesList[index]);
                   this.publicStoriesList.splice(index,1);
                },
                error: function (e) {
                    console.log('error');
                }
             }); 
        },
        deleteStory(event, index){
            event.stopPropagation();
            let title;
            console.log(this.currentList);
            if(this.currentList === "private"){
                title= this.privateStoriesList[index];
                this.privateStoriesList.splice(index,1);
            }
            else{
                title = this.publicStoriesList[index];
                this.publicStoriesList.splice(index,1);
            }
            $.ajax({
                url: '/deleteStory?title='+title+'&group='+this.currentList,
                type: 'DELETE',
                success: () =>{
                    console.log('story deleted')
                },
                error: () =>{
                    console.log('error')
                }
            });
            $("#deleteModal").modal('hide');
        },
        editStory(event, index) {
            event.stopPropagation();
            $('.content').css("display", "none");
            $('#toEditMenu').click();     
            const promise = new Promise((succ, err) => {
                bus.$on('ready',(title) => {
                    console.log(title);
                    succ('ok');
                });
            });
            
            promise.then(() => {
                console.log('emit');
                bus.$emit('titles', {privateList:this.privateStoriesList,publicList:this.publicStoriesList});
                bus.$emit('story',this.privateStoriesList[index])
            });
        },
        duplicateStory(event, index) {
            event.stopPropagation();
            $.ajax({
                url: '/copyStory/' + this.privateStoriesList[index],
                type: 'PUT',
                success: (response) =>{
                  this.privateStoriesList.push(response.title);
                },
                error: function (e) {
                    console.log(e.message);
                }
             });
        },
        createQRCode(event, index){
            event.stopPropagation();
            let story = this.publicStoriesList[index];
            //delete the current qr code
            $('#qrcode').html("");
            new QRCode('qrcode', {
                text: "http://site192001.tw.cs.unibo.it/stories?story="+story,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            $('#qrcodeMenu').show();
            $('#qrcode + p').html("Per salvare l'immagine : <code>1)Click tasto destro del mouse sul QR code. 2)Salva con nome</code>");
            /*Magari serviranno per cose future quindi ho lasciato qui queste 2 funzioni
            qrcode.clear(); // clear the code.
            qrcode.makeCode("http://naver.com"); // make another code.
            */
        },
        hideMenu(){
            $('#qrcodeMenu').hide();
        }
    },
    mounted() {        
        $.get( "/titles", (res) => {
            for(let i=0; i < res.private.length;i++){
                this.privateStoriesList.push(res.private[i]);
            }
            for(let i=0; i < res.public.length;i++){
                this.publicStoriesList.push(res.public[i]);
            }
        });
        
        //listening for updateStories event
		this.$root.$on('updateStories',(story) => {
            var current = JSON.parse(story);
            if(!current.changed) {
                if(!this.privateStoriesList.includes(current.title))
                     this.privateStoriesList.push(current.title);
            }
            else {
                var index = this.privateStoriesList.indexOf(current.original);
                this.privateStoriesList.splice(index, 1, current.title); 
            }             
        });
        
        bus.$emit('titles', {privateList:this.privateStoriesList,publicList:this.publicStoriesList});
        
    }
}