var story ;

export default {
    name: 'home',
    data() {
        return {
            step: 4,
        }
    },
    template: `
        <div id="storyDiv" style="text-align: center">
            <p id="description"> </p>
            <button id="btnDev" @click="grab"></button>
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
        $('#storyDiv').css('background-image', `url("/Server-side/stories/public/${story.title}/files/${story.background}")`);  
        $('#description').html(story.description);
        $('#btnDev').html("Prendi il " +story.device);
    }
}