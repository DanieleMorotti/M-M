import { bus } from './index.js';
import editComp from './edit.js'

export default {
    name: 'home',
    components: editComp,
    data() {
        return{
            currentStory: -1,
            storiesList: [],
            publicStoriesList: []
        }
    },
    template: `
        <div id="storySection" class="container-fluid">
            <p class="info">Storie pubblicate</p>
            <div id="publicStories">
                <span v-if="publicStoriesList.length == 0">Nessuna storia pubblicata</span>
                <div id="public-list" class="list-group" v-else>
                    <button v-for="(story,index) in publicStoriesList" :key="index" type="button" class="list-group-item list-group-item-action" @click="changeActive(index)">
                        {{story}} 
                        <span id="icon-group">
                            <i tabindex="0" class="fas fa-file-download" @click="downloadStory(index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-qrcode" @click="createQRCode(index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-trash-alt" @click="deleteStory(index)"></i>
                        </span>
                    </button>
                </div>
            </div>
            <p class="info">Seleziona la storia che vuoi modificare,copiare o eliminare</p>
            <div id="littleMenu">
                <button @click="newStory">Nuova storia <i class="fas fa-plus"></i></button>
            </div>
            <div id="stories">
                <span v-if="storiesList.length == 0">Nessuna storia presente</span>
                <div id="stories-list" class="list-group" v-else>
                    <button v-for="(story,index) in storiesList" :key="index" type="button" class="list-group-item list-group-item-action" @click="changeActive(index)">
                        {{story}} 
                        <span id="icon-group">
                            <i tabindex="0" title="edit" class="fas fa-edit" @click="editStory(index)" ></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-copy"  @click="duplicateStory(index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-file-upload" @click="loadStory(index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-qrcode" @click="createQRCode(index)"></i>&nbsp;&nbsp;
                            <i tabindex="0" class="fas fa-trash-alt" @click="deleteStory(index)"></i>
                        </span>
                    </button>
                </div>
            </div>
            <div id="qrcodeMenu">
                <div id="qrcode"></div>
                <p></p>
                <button @click="hideMenu">CHIUDI FINESTRA</button>
            </div>
        </div> 
    `,
    methods: {
        //ogni volta che clicco su un bottone per svolgere attività sulla storia viene eseguita anche questa perchè i bottoni piccoli sono dentro
        //a quello grande, in questa maniera so da quale storia è stato premuto il bottone per eseguire modifiche
        changeActive(index){
            this.currentStory = index;
        },
        newStory(){
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
                bus.$emit('titles', this.storiesList.concat(this.publicStoriesList));
            }); 
        },
        loadStory(index) {
                $.ajax({
                    url: '/publicStory/' + this.storiesList[index],
                    type: 'PUT',
                    success: (response) =>{
                       console.log("Storia resa pubblica");
                       this.publicStoriesList.push(this.storiesList[index]);
                       this.storiesList.splice(index,1);
                    },
                    error: function (e) {
                        console.log('error');
                    }
                 });        
            
        },
        downloadStory(index) {
            $.ajax({
                url: '/privateStory/' + this.publicStoriesList[index],
                type: 'PUT',
                success: (response) =>{
                   console.log("Storia resa privata");
                   this.storiesList.push(this.publicStoriesList[index]);
                   this.publicStoriesList.splice(index,1);
                },
                error: function (e) {
                    console.log('error');
                }
             }); 
        },
        deleteStory(index){
            var title = this.storiesList[index];
            this.storiesList.splice(index,1);
         //   this.currentStory = this.storiesList.length != 0 ? 0 : null;

            $.ajax({
                url: '/deleteStory/'+title,
                type: 'DELETE',
                success: () =>{
                    console.log('story deleted')
                },
                error: () =>{
                    console.log('error')
                }
            });
        },
        editStory(index) {
            $('#toEditMenu').click();     
            const promise = new Promise((succ, err) => {
                bus.$on('ready',(title) => {
                    console.log(title);
                    succ('ok');
                });
            });
            
            promise.then(() => {
                console.log('emit');
                bus.$emit('titles', this.storiesList.concat(this.publicStoriesList));
                bus.$emit('story',this.storiesList[index])
            });
        },
        duplicateStory(index) {
            console.log(this.storiesList[index]);
            $.ajax({
                url: '/copyStory/' + this.storiesList[index],
                type: 'PUT',
                success: (response) =>{
                  this.storiesList.push(response.title);
                },
                error: function (e) {
                    console.log(e.message);
                }
             });
        },
        createQRCode(index){
            console.log('here');
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
            for(let i=0; i < res.length;i++){
                this.storiesList.push(res[i]);
            }
        });

        $.get( "/publicTitles", (res) => {
            for(let i=0; i < res.length;i++){
                this.publicStoriesList.push(res[i]);
            }
        });
        
        //listening for updateStories event
		this.$root.$on('updateStories',(story) => {
            var current = JSON.parse(story);
            if(!current.changed) {
                if(!this.storiesList.includes(current.title))
                     this.storiesList.push(current.title);
            }
            else {
                var index = this.storiesList.indexOf(current.original);
                this.storiesList.splice(index, 1, current.title); 
            }             
        });

       // bus.$on('reqTitles', () => {
            bus.$emit('titles', this.storiesList.concat(this.publicStoriesList));
      //  })
      
    }
}