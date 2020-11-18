import { bus } from './index.js';
import editComp from './edit.js'

export default {
    name: 'home',
    components: editComp,
    data() {
        return{
            currentStory: -1,
            //saving here if i'm working on a story in private or public list
            currentList:"",
            privateStoriesList: [],
            publicStoriesList: []
        }
    },
    template: `

        <div id="storySection" class="container-fluid">
            <button id="newStory" @click="newStory">Nuova storia <i class="fas fa-plus"></i></button>
            <div id="publicStories">
            <p class="info">STORIE PUBBLICATE</p>
                <span v-if="publicStoriesList.length == 0">Nessuna storia pubblicata</span>
                <div id="public-list" class="list-group" v-else>
                    <button v-for="(obj,index) in publicStoriesList" :key="index" type="button" class="list-group-item list-group-item-action" @click="changeActive(index,'public')">
                        {{obj.title}} 
                        <span class="icon-group">
                            <i v-if="obj.accessibility" class="fas fa-universal-access" title="accessibility" style="transform: scale(1.1); color: #2aaa3f;"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-file-download" @click="downloadStory(event,index)" title="download"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-qrcode" @click="createQRCode(event, index)" title="qrcode"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-trash-alt" data-toggle="modal" data-target="#deleteModal" title="delete"></i>
                        </span>
                        <div class="content" style="display:none"></div>
                    </button>
                </div>
            </div>
            
            
            <div id="privateStories">
            <p class="info">STORIE PRIVATE <br>Seleziona la storia che vuoi modificare, copiare, eliminare o pubblicare.</p>
                <span v-if="privateStoriesList.length == 0">Nessuna storia presente</span>
                <div id="private-list" class="list-group" v-else>
                    <button v-for="(story,index) in privateStoriesList" :key="index" type="button" class="list-group-item list-group-item-action " @click="changeActive(index,'private')">
                        {{story.title}} 
                        <span class="icon-group">
                            <i v-if="story.accessibility" class="fas fa-universal-access" title="accessibility" style="transform: scale(1.1); color: #2aaa3f;"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-edit" @click="editStory(event, index)" title="edit"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-copy"  @click="duplicateStory(event,index)" title="copy"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-file-upload" @click="loadStory(event,index)" title="upload"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-trash-alt" data-toggle="modal" data-target="#deleteModal" title="delete"></i>
                        </span>
                        <div class="content" style="display:none"></div>
                    </button>
                </div>
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

            <!-- Modal for qrcode -->

            <div class="modal fade" id="qrcodeModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" >QRCode</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="qrcode"></div>
                            <br>
                            <p>Per salvare l'immagine : <br><code>1. Click tasto destro del mouse sul QR code. <br>2. Salva con nome</code></p>
                        </div>                        
                    </div>
                </div>
            </div>

        </div> 
    `,
    methods: {
        //every time i click on a story button to do something on it i execute this function
        changeActive(index,list){
            this.currentStory = index;
            this.currentList = list;
            let current = list + '-list';
            let title;

            if(list == 'private') title = this.privateStoriesList[index].title;
            else title = this.publicStoriesList[index].title;

            if($(`#${current} div:eq(${index})`).css("display") == "block")
                $(`#${current} div:eq(${index})`).css("display", "none");
            else {
                $.ajax({
                    url: '/getStory?title='+title+'&group='+list,
                    type: 'GET',
                    success: (data) =>{
                        let parsed = JSON.stringify(data,null,2);

                        //remove all the brackets from the json
                        parsed = parsed.replace(/("|\[(\n\s*)\{|\[|\]|\{|\}\n|\}|\[|,|)/g,"");
                        console.log(parsed)
                        //substitution of all the field name with the uppercase
                        parsed = parsed.split('\n').map((line)=>{
                            if(line){
                                if(line.split(':')[1]) 
                                    return line.split(':')[0].toUpperCase() + ": "+ line.split(':')[1];
                                
                                //return the old string as it was
                                else return line.split(':')[0];
                            }
                        }).join('\n')
                        
                        $(`#${current} div:eq(${index})`).html("<hr><pre>"+parsed+"</pre>");
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
                bus.$on('over',(msg) => {
                    succ('ok');
                });
            });
            
            promise.then(() => {
                bus.$emit('story','');
                bus.$emit('titles', {privateList:this.privateStoriesList,publicList:this.publicStoriesList});
            }); 
        },
        loadStory(event, index) {
            event.stopPropagation();
                $.ajax({
                    url: '/publicStory/' + this.privateStoriesList[index].title,
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
                url: '/privateStory/' + this.publicStoriesList[index].title,
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
            //console.log(this.currentList);
            if(this.currentList === "private"){
                title= this.privateStoriesList[index].title;
                this.privateStoriesList.splice(index,1);
            }
            else{
                title = this.publicStoriesList[index].title;
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
                    succ('ok');
                });
            });
            
            promise.then(() => {
                bus.$emit('titles', {privateList:this.privateStoriesList,publicList:this.publicStoriesList});
                bus.$emit('story',this.privateStoriesList[index].title);
            });
        },
        duplicateStory(event, index) {
            event.stopPropagation();
            $.ajax({
                url: '/copyStory/' + this.privateStoriesList[index].title,
                type: 'PUT',
                success: (response) =>{
                  this.privateStoriesList.push({title:response.title,missionsList:this.privateStoriesList[index].missionsList});
                },
                error: function (e) {
                    console.log(e.message);
                }
             });
        },
        createQRCode(event, index) {
            event.stopPropagation();

            $('#qrcodeModal').modal('show');
            let story = this.publicStoriesList[index].title;
            //delete the current qr code
            $('#qrcode').html("");
            new QRCode('qrcode', {
                text: "http://site192001.tw.cs.unibo.it/getStory?title="+story,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            /*Magari serviranno per cose future quindi ho lasciato qui queste 2 funzioni
            qrcode.clear(); // clear the code.
            qrcode.makeCode("http://naver.com"); // make another code.
            */
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
                if(!this.privateStoriesList.some(obj => obj.title === current.titleMission.title))
                    this.privateStoriesList.push({title:current.titleMission.title, missionsList: current.titleMission.missionsList});
                else{
                    let ind = this.privateStoriesList.findIndex(x => x.title === current.titleMission.title);
                    this.privateStoriesList[ind] = {title:current.titleMission.title, missionsList: current.titleMission.missionsList};
                }
            }
            else {
                let index = this.privateStoriesList.findIndex(x => x.title === current.original);
                this.privateStoriesList.splice(index, 1, {title:current.titleMission.title, missionsList:current.titleMission.missions}); 
            }             
        });
        
        bus.$emit('titles', {privateList:this.privateStoriesList,publicList:this.publicStoriesList});
        
    }
}