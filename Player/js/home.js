import { bus } from './index.js';
var story ;

export default {
    name: 'home',
    data() {
        return {
            over: false
        }
    },
    template: `
        <div id="storyDiv" style="text-align: center">
            <p id="description"> </p>
            <button id="startBtn" @click="grab"></button>
        </div> 
    `,
    methods: {
        grab: function() {
            $('#toDevice').prop("disabled", false);
            $('#description').html("");
            $('#btnDev').html(story.pocketItem);
            //simulate the click on the router-link that show the device
            $('#toDevice').click();
            $('#bottomBtn').css("display", "block");
        }
    },
    activated() {

        if(this.over) {
            $('#description').html(` <h1>Partita finita</h1>
            <p>Grazie per aver giocato, speriamo tu ti sia divertito e possa aver imparato cose nuove!</p>`);
            $('body').css('background-image', 'none');
            $('body').css('background-color', 'black');
            $('#startBtn').remove();
            $('#bottomBtn').remove();
        }
        else {
            story = JSON.parse(localStorage.getItem("story"));
            $('body').css('background-image', `url("/Server-side/stories/public/${story.title}/files/${story.background}")`);  
            $('#description').html(story.description);
            $('#startBtn').html("Inizia la storia");
        }
        
        bus.$on('over',(msg) => {
            this.over = true;
        });
    }
}