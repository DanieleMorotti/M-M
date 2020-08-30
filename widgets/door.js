
export default {
    name: 'door',
    template: `
        <div id="doorInstructions" > 
            <div id="paper">
                <input type="text" id="word"/>
                <br>
            </div>
        </div>
    `,
    mounted()  {
        var story = JSON.parse(localStorage.getItem("story"));
        var current = JSON.parse(localStorage.getItem("current"));
        var background = story[0].activities[current].background;
        $('#doorInstructions').css('background-image', 'url('+background+')');
        $('#doorInstructions').prepend("<p>"+story[0].activities[current].instructions+"</p>");
        $('#word').attr("placeholder",story[0].activities[current].definition);
        var pos = $("#paper").position();
        //console.log(pos);

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
                        if(risp.toLowerCase() == story[0].activities[current].risposta) {
                            $("input").hide();
                            $("<p id='x'>"+risp+"</p>").insertBefore("#word");
                            $("#x").delay(2000).css('color', '#0f0').fadeOut(function(){
                                window.location.href = "/#/device";
                            });
                        }
                        else 
                            $("<p style='text-decoration: line-through'>"+risp+"</p>").insertBefore("#word");
                    }
                    
                    
                } 
            })
    },
    
}