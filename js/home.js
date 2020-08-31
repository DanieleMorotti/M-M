var story ;

export default {
    name: 'home',
    data() {
        return {
            step: 4,
        }
    },
    story: 'ciao',
    template: `
        <div id="storyDiv" style="text-align: center">
            <p id="description"> {{step}} </p>
            <button id="btnDev" @click="grab"></button>
        </div> 
    `,
    methods: {
        grab: function() {
            $('#toDevice').prop("disabled", false);
            $('#description').html("");
            $('#btnDev').html(story[0].pocketItem);
            $('#toDevice').click();
        },
        render() {
            story = JSON.parse(localStorage.getItem("story"));
            $('#storyDiv').css('background-image', 'url('+story[0].background+')');
            $('#description').html(story[0].description);
            $('#btnDev').html("Prendi il " +story[0].pocketItem);
        }
    }
}