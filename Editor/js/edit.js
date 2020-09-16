export default {
    name: 'editMenu',
    data() {
        return{
            lastActivity:1,
            activities: []
        }
    }, //action="/stories" method="POST"
    template: `
        <div id="editMenu" class="container">
            <p>Inserisci i dati per creare la tua nuova storia </p>
            <form id="editStoryForm">
                <ul>
                    <li>
                        <label for="inpTitle">Inserisci il titolo: </label>
                        <input type="text" name="title" id="inpTitle"/>
                    </li>
                    <li>
                        <label for="inpSett">Inserisci l'ambientazione:</label>
                        <input type="text" name="setting" id="inpSett" />
                    </li>
                    <li>
                        <label for="inpBack">Inserisci lo sfondo:</label>
                        <input type="file" name="background" id="inpBack" accept="image/*" />
                    </li>
                    <li>
                        <label for="inpDescr">Inserisci una breve descrizione iniziale alla storia:</label><br>
                        <textarea id="inpDescr" name="description" rows="3" cols="40"></textarea>
                    </li>
                    <li>
                        <label for="inpObj">Inserisci il nome dell'oggetto che il cellulare rappresenterà:</label>
                        <input type="text" name="pocketItem" id="inpObj" />
                        <ul>
                            <li>
                                <label for="inpObjCss">Aggiungi un file CSS</label>
                                <input type="file" name="pocketItemCss" id="inpObjCss" accept="text/css" />
                            </li>
                            <li>
                                <label for="inpObjJs">Aggiungi un file JS</label>
                                <input type="file" name="pocketItemJs" id="inpObjJs" accept=".js" />
                            </li>
                        </ul>
                    </li>
                    <li>
                        <label for="inpIntr">Inserisci l'introduzione della tua storia:</label><br>
                        <textarea id="inpDescr" name="introduction" rows="3" cols="40"></textarea>
                    </li>
                    <li>    
                        <h2>Attività</h2>
                        <ul id="activitiesSaved">
                            <p> Nessuna attività per questa storia </p>
                        </ul>

                        <input type="button" @click="deleteActivity" value="Rimuovi attività" />

                    </li>
                </ul>
            </form>

            <form id="activitiesForm" @submit="addActivity">
                <h2>Attività</h2>
                <ul id="activitiesList">
                    <li>
                        <h5>Scegli il tipo dell'attività : </h5>
                        <input id="multipleChoice" type="radio" name="activityTypeGroup" value="scelta multipla" checked />
                        <label for="multipleChoice">Scelta multipla</label>
                        <input id="openQuest" type="radio" name="activityTypeGroup" value="domanda aperta" />
                        <label for="openQuest">Domanda aperta</label>
                        <input id="figur" type="radio" name="activityTypeGroup" value="figurativa" />
                        <label for="figur">Figurativa</label>

                        <h5>Dove si svolge l'attività?(ambientazione)</h5>
                        <input type="text" name="where" />

                        <h5>Spiegazione per lo svolgimento dell'attività:</h5>
                        <textarea name="instructions" rows="3" cols="40"></textarea>
                    </li>
                </ul>
                <input type="submit" value="Salva attività" />
            </form>
            <button @click="checkForm">FINITO</button>
        </div> 
    `,
    methods: {
        deleteActivity(){
            //if there's more than one story
            if($('#activitiesSaved > li').length != 1){
                $('#activitiesSaved > li:last-child').remove();
            }else{
                $('#activitiesSaved').html('<p>Nessuna attività per questa storia</p>');
            }
            /*TODO
            se mettiamo un cestino(icona) per eliminare una determinata attività dobbiamo vedere il suo indice ed eliminarla da activities
            se no la eliminiamo dalla lista visibile e non dal json
            */

            //the min value can be 1, because the first activity is the number 1
            if((this.lastActivity - 1) > 0) this.lastActivity--;
        },
        addActivity(e) {             
            e.preventDefault();
            let activity = {
                type: $("#activitiesList li input:checked").val(),
                setting:  $("#activitiesList li input[name='where']").val(),
                instructions: $("#activitiesList li textarea[name='instructions']").val()
            }
            this.activities.push(activity);
            
            //if there were 0 stories, i need to remove the informative message,then i push to the list the activity that i saved
            if($('#activitiesSaved > p'))$('#activitiesSaved > p').remove();
            $('#activitiesSaved').append('<li>Attività '+ this.lastActivity +'</li>');
            this.lastActivity++;

            $('#activitiesForm')[0].reset();
        },
        checkForm: function() {
            var data = new FormData($('#editStoryForm')[0]);// $('#editStoryForm').serializeArray();
            
            /*
            var obj = {};
            $.map(array, function(n){
                obj[n['name']] = n['value'];
            });
            
            for(let [name, value] of array) {
                obj[name] = value; 
                console.log(name,value);
            }
            obj.activities = this.activities;

            $('#editStoryForm')[0].reset();
            this.activities = [];

            $.post( "/story", JSON.stringify(obj), function(res) {
                console.log("post con successo");
            });*/

            data.append('activities',JSON.stringify(this.activities));
            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/story",
                data: data,
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log("success");
                },
                error: function (e) {
                    console.log("error");
                }
            });
            $('#toHome').click();
        }
    },
    mounted(){
        
    }   
}