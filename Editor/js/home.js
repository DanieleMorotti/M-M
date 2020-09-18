import { bus } from './index.js';
import editComp from './edit.js'

export default {
    name: 'home',
    components: editComp,
    data() {
        return{
            currentStory: 0,
            storiesList: []
        }
    },
    template: `
        <div id="storySection" class="container-fluid">
            <p id="info">Seleziona la storia che vuoi modificare,copiare o eliminare</p>
            <div id="littleMenu">
                <button @click="newStory">Nuova storia <i class="fas fa-plus"></i></button>
                <button>Carica storia <i class="fas fa-upload"></i></button>
            </div>
            <div id="stories">
                <span v-if="storiesList.length == 0">Nessuna storia presente</span>
                <div id="stories-list" class="list-group" v-else>
                    <button v-for="(story,index) in storiesList" :key="index" type="button" class="list-group-item list-group-item-action" 
                    @click="changeActive(index)"> {{story}} <span id="icon-group"><i class="fas fa-edit" @click="editStory(index)"></i>&nbsp;&nbsp;<i tabindex="0" class="fas fa-file-upload"></i>&nbsp;&nbsp;
                    <i tabindex="0" class="fas fa-qrcode"></i>&nbsp;&nbsp;<i tabindex="0" class="fas fa-trash-alt" @click="deleteStory(index)"></i></span></button>
                </div>
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
                bus.$emit('story','')
            }); 
        },
        deleteStory(index){
            var title = this.storiesList[index];
            this.storiesList.splice(index,1);
            this.currentStory = this.storiesList.length != 0 ? 0 : null;

            $.ajax({
                url: '/story/'+title,
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
                bus.$emit('story',this.storiesList[index])
            });
        }
    },
  
    mounted() {        
        $.get( "/titles", (res) => {
            for(let i=0; i < res.length;i++){
                this.storiesList.push(res[i]);
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
      
    }
}