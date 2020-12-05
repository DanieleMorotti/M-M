
var risposta = false;

export default {
    name: 'door',
    template: `
            <link rel="stylesheet" href="/Server-side/widgets/hieroglyph/hieroglyph.css">
            <div id="paper">
                <input type="text" id="word" />
                <br>
                <table id="answers">
                <tbody>
                    <tr> 
                    <td class="droppable"></td>                       
                    <td class="droppable"></td>   
                    <td class="droppable" ></td>
                    <td class="droppable"></td>
                    <td></td>
                    </tr>
                </tbody>
                </table>
                <br>
                <table style="font-size:large;text-align:center;font-family: sans-serif,'Aegyptus_R','Aegyptus_B','Gardiner','NewGardiner','Segoe UI Historic';">
                    <tbody>
                        <tr> 
                        <td title="U+13000: EGYPTIAN HIEROGLYPH A001">𓀀</td>                       
                        <td title="U+13005: EGYPTIAN HIEROGLYPH A005A">𓀅</td>   
                        <td title="U+13041: EGYPTIAN HIEROGLYPH A056">𓁁</td>
                        <td title="U+13080: EGYPTIAN HIEROGLYPH D010">𓂀</td>
                        <td title="U+13161: EGYPTIAN HIEROGLYPH G029">𓅡</td>
                        </tr>
                    </tbody>
                </table>
            </div>
    `,
    methods: {
        render(question, answer) {
            $( "table td" ).draggable( {
                cursor: "grabbing",
            
                stop: function() {
                    // Show dropped position.
                    var Stop = $(this).position();

                    
                } 
            }) 

            $( ".droppable" ).droppable({
                drop: function( event, ui ) {
                  $( this )
                    .css("border","1px solid greenyellow" );
                }
              })

        },
        check() {
            return(risposta)
        }
      
    }
    
}