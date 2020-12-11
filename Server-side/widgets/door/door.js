
var risposta = false;

export default {
    name: 'door',
    template: `
            <link rel="stylesheet" href="/Server-side/widgets/door/door.css">
            <p id="question"> Trascina il foglio verso l'alto per passarlo sotto la porta. </p>
            <div id="paper" v-chat-scroll>
                <input type="text" id="word" />
                <br>
            </div>
    `,
    methods: {
        render(question, answer) {
            $('#question').prepend(`<span style="color: orange">${question}</span><br>`);
             $('#word').attr("placeholder", "Inserisci risposta");
            var pos = $("#paper").position();
            

           $('#paper').hover(function() {
               $(this).focus();
           }) 

            $( "#paper" ).draggable( {
                cursor: "grabbing",
                containment: "window",
                stop: function() {

                    // Show dropped position.
                    
                    var Stop = $(this).position();
                    if(Stop.top < 0) {
                        
                        var risp = document.getElementById("word").value;
                        setTimeout(function() {
                            $("#paper").css({ position: "relative", top: 0, left: Stop.left});
                            $("#paper").scrollTop($('#paper').height());
                        }, 1000);
                
                        document.getElementById("word").value = "";
                        if(risp.toLowerCase() == answer) {
                            $("input").hide();
                            $("<p id='x'>"+risp+"</p>").insertBefore("#word");
                            $("#x").delay(2000).css('color', '#0f0').fadeIn(function(){
                                $('#paper').draggable( "destroy" )
                                document.getElementById("widgetNav").style.height = "0%";
                                risposta = true;
                            });
                        }
                        else 
                            $("<p style='text-decoration: line-through'>"+risp+"</p>").insertBefore("#word");
                    }             
                } 
            }) 

        },
        check() {
            return(risposta)
        }
    }
    
}