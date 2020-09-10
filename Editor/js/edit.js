
export default {
    name: 'editMenu',
    data() {
        return{
            //i save the menu to create a new activity 'template' and simply append this to the ul
            newActivityMenu: null,
            lastActivity:1
        }
    },
    template: `
        <div id="editMenu" class="container">
            <p>Inserisci i dati per creare la tua nuova storia </p>
            <form action="/stories" method="POST" id="editStoryForm">
                <ul>
                    <li>
                        <label for="inpTitle">Inserisci il titolo: </label>
                        <input type="text" name="title" id="inpTitle" />
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
                        <ul id="activitiesList">
                            <h2>Attività </h2>
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
                        <input type="button" @click="newActivity" value="Nuova attività" />
                        <input type="button" @click="deleteActivity" value="Rimuovi attività" />
                    </li>
                </ul>
                <input type="submit" value="Finito" />
            </form>
        </div> 
    `,
    methods: {
        newActivity(){
            this.lastActivity++;
            //if there aren't activities i remove the informative message
            if($('#activitiesList > p'))$('#activitiesList > p').remove();
            $('#activitiesList').append(this.newActivityMenu);

            //change the id to id+'activity number'
            var changeId = $('#activitiesList > li:nth-child('+this.lastActivity+') [id]');
            for(let i=0;i<changeId.length;i++){
                changeId[i].id += this.lastActivity;
            }
            //change the for attribute to id+'activity number'
            var changeId = $('#activitiesList > li:nth-child('+this.lastActivity+') [for]');
            for(let i=0;i<changeId.length;i++){
                changeId[i].htmlFor += this.lastActivity;
            }
            //change the name attribute to name+'activity number'
            var changeId = $('#activitiesList > li:nth-child('+this.lastActivity+') [name]');
            for(let i=0;i<changeId.length;i++){
                changeId[i].name += this.lastActivity;
            }
        },
        deleteActivity(){
            //if there's more than one story
            if($('#activitiesList > li').length != 1){
                $('#activitiesList > li:last-child').remove();
                $('#activitiesList > h2:last-child').remove();
            }else{
                $('#activitiesList').html('<p>Nessuna attività per questa storia</p>');
            }
            if(this.lastActivity-- != -1) this.lastActivity--;
        }
    },
    mounted(){
        this.newActivityMenu = $('#activitiesList').html();
    }
}