export default {
    name: 'lock',
    template: `
        <div id="lock">
            <input id="risp" type="text" placeholder="Inserisci numero " v-on:keyup.13="check"><br>
        </div>
    `,
    mounted() {
        var story = JSON.parse(localStorage.getItem("story"));
        var current = JSON.parse(localStorage.getItem("current"));
        var background = story[0].activities[current].background;
        $('#lock').css('background-image', 'url('+background+')');
        $( "#lock" ).prepend("<p>"+story[0].activities[current].quesito+"</p>");
    },
    methods: {
        check() {
            var risp = document.getElementsByTagName("input")[0].value;
            if(risp != '120') {
                document.getElementsByTagName("input")[0].value = "";
                return;
            }
            else {
                $('#risp').css('color', '#0f0').fadeOut(function(){
                    $(this).animate({
                        marginTop: 150
                    });
                    window.location.href = "/#/device";

                });
            }
        }
    }
}