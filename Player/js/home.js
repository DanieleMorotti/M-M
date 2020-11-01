var story ;

export default {
    name: 'home',
    data() {
        return {
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
        },
        
    },
    activated() {
        story = JSON.parse(localStorage.getItem("story"));
        $('body').css('background-image', `url("/Server-side/stories/public/${story.title}/files/${story.background}")`);  
        $('#description').html(story.description);
        $('#startBtn').html("Inizia la storia");
    }
}