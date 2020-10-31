export function template() {
    $('#schermo').append(`
    <link rel="stylesheet" href="/Player/widgets/door.css">
    <div id="paper">
        <input type="text" id="word"/>
        <br>
    </div>`
    );
}

export function render(question, answer) {
    $('#word').attr("placeholder", question);
    var pos = $("#paper").position();
    var correct = false;
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
                            this.answer = true;
                        });
                    }
                    else 
                        $("<p style='text-decoration: line-through'>"+risp+"</p>").insertBefore("#word");
                }
                
                
            } 
        })
}

export default {
    name: 'door',
    data() {
        return{
            answer: false
        }
    },
    template: `
            <link rel="stylesheet" href="/Player/widgets/door.css">
            <div id="paper">
                <input type="text" id="word"/>
                <br>
            </div>
    `,
    methods: {
        render(question, answer) {
            $('#word').attr("placeholder", question);
            var pos = $("#paper").position();
            var correct = false;
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
                                    this.answer = true;
                                });
                            }
                            else 
                                $("<p style='text-decoration: line-through'>"+risp+"</p>").insertBefore("#word");
                        }
                        
                        
                    } 
                })
        },
        check() {
            return(this.answer)
        }
    }
  
    
}