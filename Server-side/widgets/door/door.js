
var risposta = false;

export default {
    name: 'door',
    template: `
            <link rel="stylesheet" href="/Server-side/widgets/door/door.css">
            <div id="paper">
                <input type="text" id="word"/>
                <br>
            </div>
    `,
    methods: {
        render(question, answer) {
            this.init()
            $('#word').attr("placeholder", question);
            var pos = $("#paper").position();

            pos.left = 25;
                $( "#paper" ).draggable( {
                    cursor: "grabbing",
                
                    stop: function(event, ui) {
                        // Show dropped position.
                        var Stop = $(this).position();
        
                        if(Stop.top < 0) {
                            var risp = document.getElementById("word").value;
                            setTimeout(function() {
                                $("#paper").css({ position: "absolute", top: pos.top, left: pos.left});
                            }, 1000);
                    
                            document.getElementById("word").value = "";
                            if(risp.toLowerCase() == answer) {
                                $("input").hide();
                                $("<p id='x'>"+risp+"</p>").insertBefore("#word");
                                $("#x").delay(2000).css('color', '#0f0').fadeIn(function(){
                                    $('#paper').draggable( "destroy" )
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