
export default {
    name: 'home',
    data() {
        return{
            currentStory: 0,
            storiesList:[{name:"pinocchio",data:0},{name:"mulan",data:0}]
        }
    },
    template: `
        <div id="storySection" class="container-fluid">
            <p id="info">Seleziona la storia che vuoi modificare,copiare o eliminare</p>
            <div id="menu">
                <button>Nuova storia <i class="fas fa-plus"></i></button>
                <button>Carica storia <i class="fas fa-upload"></i></button>
            </div>
            <div id="stories">
                <span v-if="storiesList.length == 0">Nessuna storia presente</span>
                <div id="stories-list" class="list-group" v-else>
                    <button v-for="(story,index) in storiesList" :key="index" type="button" class="list-group-item list-group-item-action" 
                    @click="changeActive(index)"> {{story.name}} <span id="icon-group"><i tabindex="0" class="fas fa-file-upload"></i>&nbsp;&nbsp;
                    <i tabindex="0" class="fas fa-qrcode"></i>&nbsp;&nbsp;<i tabindex="0" class="fas fa-trash-alt"></i></span></button>
                </div>
            </div>
        </div> 
    `,
    methods: {
        changeActive(index){
            this.currentStory = index;
        }
    }
}