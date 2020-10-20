import { bus } from './index.js';

export default {
    name: 'editMenu',
    data() {
        return{
            missions: [{name:"Missione 1",activities:[],isActive:false}],
            isNewStory: false,
            currentActivity: 0,
            type: 'scelta multipla',
            answerList: [],
            currentMission: 0,
            currentStory: '',
            //i save here the index of the mission where i will copy the activity
            missionWhereCopy: 0,
            //i save here the name of the story where i will copy activity or mission
            storyWhereIcopy:'',
            //this obj has 2 properties: publicList and privateList,which contain 2 properties title and missionsList
            titles: [],
            widgets: [],
            currentWidget: -1,
            devices: [],
            currentDevice: -1,
            invalid: false,
            value: 50,
            facilitiesList: [],
            difficultiesList: []
        }
    }, 
    template: `
        <div id="editMenu" class="container">
            <p id="title">Inserisci i dati per creare la tua nuova storia </p>
            <form id="editStoryForm">
                <ul>
                    <li>
                        <label for="inpTitle">Inserisci il titolo: </label>
                        <input type="text" name="title" id="inpTitle" v-on:keyup="checkName('title')" required/>
                        <p id="titleInfo"> Una storia con questo titolo esiste già</p>
                    </li>
                    <li>
                        <label for="inpSett">Inserisci l'ambientazione:</label>
                        <input type="text" name="setting" id="inpSett" />
                    </li>
                    <li>
                        <label for="inpBack">Inserisci lo sfondo:</label>
                        <input type="file" name="background" id="inpBack" accept="image/*" />
                        <p class="infoForFile"></p>
                    </li>
                    <li>
                        <label for="inpDescr">Inserisci una breve descrizione iniziale alla storia:</label><br>
                        <textarea id="inpDescr" name="description" rows="3" cols="40"></textarea>
                    </li>
                    <li>
                        <label for="buttonDevice">Scegli il dispositivo che il cellulare rappresenterà:</label><br>
                        <input type="button" id="buttonDevice" data-toggle="modal" data-target="#deviceModal" value="Scegli"/>
                        <p id="infoDevice" style="display:none"> </p>
                    </li>
                    <li>
                        <label for="inpIntr">Inserisci l'introduzione della tua storia:</label><br>
                        <textarea id="inpIntr" name="introduction" rows="3" cols="40"></textarea>
                    </li>
                    <li>
                        <label for="inpConcl">Inserisci la conclusione della tua storia:</label><br>
                        <textarea id="inpConcl" name="conclusion" rows="3" cols="40"></textarea>
                    </li>
                    <li>    
                        <h2 style="display:inline-block">Missioni</h2>&nbsp;&nbsp;<i class="fas fa-plus" @click="addMission"></i>
                        <button id="showGraph"  v-on:click.stop.prevent="show(event)">Grafo attività</button>
                      
                        <!-- The Modal -->
                        <div id="graphModal" class="modal">
                            <span class="close">&times;</span>
                            <svg ></svg>
                        </div> 
                        

                        <ul id="missionSaved">
                            <li v-for="(mission,index) in missions" :key="index">
                                <input type="checkbox" name="isActive" :checked="mission.isActive" @click="mission.isActive = !mission.isActive" />&emsp;
                                {{mission.name}}&emsp;
                                <span class="icon-group">
                                    <i class="fas fa-cut" @click="currentMission = index" data-toggle="modal" data-target="#moveMissionModal" v-if="index != 0"></i>&nbsp;&nbsp;
                                    <i class="fas fa-clone"  @click="currentMission = index" data-toggle="modal" data-target="#copyMissionModal"></i>&nbsp;&nbsp;
                                    <i  class="fas fa-trash-alt" @click="deleteMission(index)" v-if="index != 0"></i>
                                </span>
                                <ul id="activitiesSaved" v-if="mission.activities.length != 0">
                                    <li v-for="(activity,ind) in mission.activities" :key="ind">
                                        <input type="checkbox" name="isActive" :checked="activity.isActive" @click="activity.isActive = !activity.isActive" />&emsp;
                                        Attività {{parseInt(activity.number) + 1}}&emsp;
                                        <span class="icon-group">
                                            <i class="fas fa-edit" @click="editActivity(ind,index)"></i>&nbsp;&nbsp;
                                            <i class="fas fa-cut" @click="currentActivity = ind;currentMission = index" data-toggle="modal" data-target="#moveActivityModal"></i>&nbsp;&nbsp;
                                            <i class="fas fa-clone"  @click="currentActivity = ind;currentMission = index" data-toggle="modal" data-target="#copyActivityModal"></i>&nbsp;&nbsp;
                                            <i  class="fas fa-trash-alt" @click="deleteActivity(ind,index)"></i>
                                        </span>
                                    </li>
                                </ul>
                                <p v-else>Nessuna attività per questa missione </p>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h3>Facilitazioni</h3>
                        <label for="facility">Inserisci una facilitazione:</label><br>                 
                        <input id="facility" type="text" name="facility" @keyup.enter="addFacility(event)"/>
                        <button id="insertFacility" @click="addFacility(event)">Aggiungi</button>
                        <ul id="facilities">
                            <li v-for="(facility,index) in facilitiesList" :key="index">
                             {{facility}}  &nbsp;&nbsp;
                            <i class="fas fa-trash-alt" @click="facilitiesList.splice(index,1)"></i>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h3>Difficoltà</h3>
                        <label for="difficulty">Inserisci una difficoltà:</label><br>                 
                        <input id="difficulty" type="text" name="difficulty" @keyup.enter="addDifficulty(event)"/>
                        <button id="insertDifficulty" @click="addDifficulty(event)">Aggiungi</button>
                        <ul id="difficulties">
                            <li v-for="(difficulty,index) in difficultiesList" :key="index">
                             {{difficulty}}  &nbsp;&nbsp;
                            <i class="fas fa-trash-alt" @click="difficultiesList.splice(index,1)"></i>
                            </li>
                        </ul>
                    </li>
                </ul>
            </form>
            <button @click="checkForm">FINITO</button><span id="selMissErr">Nessuna missione è stata attivata</span>

            <form id="activitiesForm" @submit="addActivity">
                <h2>Nuova attività</h2>
                <ul id="activitiesList">
                    <li>
                        <label for="chooseMission">Scegli in quale missione aggiungerla: </label>
                        <select name="mission" id="chooseMission">
                            <option v-for="(mission,index) in missions" :key="index" :value="mission.name"> {{mission.name}}</option>
                        </select>
                        <h5>Scegli il tipo dell'attività : </h5>
                        <input id="multipleChoice" type="radio" v-model="type" value="scelta multipla" name="activityTypeGroup" checked/>
                        <label for="multipleChoice">Scelta multipla</label>
                        <input id="openQuest" type="radio" v-model="type" value="domanda aperta" name="activityTypeGroup" />
                        <label for="openQuest">Domanda aperta</label>
                        <input id="figur" type="radio" v-model="type" value="figurativa" name="activityTypeGroup" />
                        <label for="figur">Figurativa</label>

                        <h5>Dove si svolge l'attività?(ambientazione)</h5>
                        <input type="text" name="where" />

                        <h5>Spiegazione per lo svolgimento dell'attività:</h5>
                        <textarea name="instructions" rows="3" cols="40"></textarea>

                        <div id="questionDiv">
                            <label for="question">Inserisci la domanda:</label><br>
                            <input id="question" type="text" name="question" /><br>
                            <label for="answer">Inserisci una risposta:</label><br>
                    
                        <div v-if="type=='scelta multipla'">
                            <input id="answer" type="text" name="answer" @keyup.enter="addAnswer(event)"/>
                            <button id="insertAnswer" @click="addAnswer(event)">Aggiungi risposta</button>
                            <p v-if="answerList.length">Seleziona la risposta corretta</p>
                            <ul id="answers">
                                <li v-for="(answer,index) in answerList" :key="index">
                                <input type="radio" :id="index" name="answer" :value="answer" checked>
                                <label :for="index"> {{answer}} </label>
                                 &nbsp;&nbsp;
                                <i class="fas fa-trash-alt" @click="answerList.splice(index,1)"></i>
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            <input id="answer" type="text" name="answer" :disabled="type =='figurativa'" />
                        </div>

                            <label for="score">Inserisci un punteggio da assegnare:</label><br>
                            <input id="score" type="range" min="10" max="100" step="5"  v-model="value" name="score"/>
                            <span v-text="total" id="scoreValue"></span>

                            <div>
                                <p>Scegli l'attività successiva: </p>
                                <ul>
                                <li>
                                    <label for="nextActvityCorrect"> in caso di risposta corretta</label><br>
                                    <select id="nextActivityCorrect" name="nextActivityCorrect" :disabled="missions.length == 1 && missions[0].activities.length == 0">
                                        <option value="-/-" > Missione -  Attività -  </option> 
                                        <template v-for="(mission, indMiss) in missions" :key="indMiss"> 
                                        <option v-for="activity in mission.activities" :value="indMiss+'/'+activity.number"> 
                                        {{mission.name}} Attività {{activity.number + 1}}
                                        </option>
                                        </template>
                                        <option value="x/x" > Conclusione </option> 
                                    </select>
                                </li>
                                <li>
                                    <label for="nextActvityIncorrect"> in caso di risposta errata</label><br>
                                    <select id="nextActivityIncorrect" name="nextActivityIncorrect" :disabled="missions.length == 1 && missions[0].activities.length == 0">
                                        <option value="-/-" > Missione -  Attività -  </option> 
                                        <template v-for="(mission, indMiss) in missions" :key="indMiss"> 
                                        <option v-for="activity in mission.activities" :value="[indMiss]+'/'+[activity.number]"> 
                                        {{mission.name}} Attività {{activity.number + 1}}
                                        </option>
                                        </template>
                                        <option value="x/x" > Conclusione </option> 
                                    </select>
                                </li>
                                </ul>
                            </div>
                        </div>
                        
                
                        <h5>Scegli un widget per questa attività</h5>
                        <input type="button" id="buttonWidget" data-toggle="modal" data-target="#widgetModal" value="Scegli"/>
                        <p id="infoWidget" style="display:none"> </p>
                    </li>
                </ul>
                <input id="saveActivity" type="submit" value="Salva attività" />
            </form>
            <form id="widgetsForm" @submit="addWidget">
                <h2>Nuovo widget</h2>
                <ul>
                    <li>
                        <h5>Crea un nuovo widget: </h5>
                        <label for="inpWidgetName">Nome del widget:</label>
                        <input type="text" id="inpWidgetName" name="name" v-on:keyup="checkName('widget')" required/>
                        <p id="widgetInfo"> Un widget con questo nome esiste già</p>
                    </li>
                    <li>
                        <label for="inpWidgetCss">Aggiungi un file CSS</label>
                        <input type="file" name="widgetCss" id="inpWidgetCss" accept="text/css" required/>
                    </li>
                    <li>
                        <label for="inpWidgetJs">Aggiungi un file JS</label>
                        <input type="file" name="widgetJs" id="inpWidgetJs" accept=".js" required/>
                    </li>
                </ul>
                <input id="saveWidget" type="submit" value="Salva widget" />
            </form>

            <!-- Modals for copy or move an activity -->
            <div class="modal fade" id="moveActivityModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Spostamento attività</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span>Scegli in quale storia e missione spostare l'attività </span>
                            <div class="dropdown" v-for="(obj,index) in titles.privateList" :key="index" @click="storyWhereIcopy=obj.title">
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">
                                    {{obj.title}}
                                </button>
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" v-for="(miss,ind) in obj.missionsList" :key="ind" @click="missionWhereCopy=ind">{{miss}}</a>
                                </div>
                            </div>
                            <div class="dropdown" v-if="isNewStory" @click='storyWhereIcopy="newstory"'>
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">
                                    In questa storia
                                </button>
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" v-for="(miss,i) in missions" :key="i" @click="missionWhereCopy=i">{{miss.name}}</a>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" @click="moveActivity(currentActivity)">SPOSTA</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="copyActivityModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Copia di un'attività</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span>Scegli in quale storia e missione copiare l'attività </span>
                            <div class="dropdown" v-for="(obj,index) in titles.privateList" :key="index" @click="storyWhereIcopy=obj.title">
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">
                                    {{obj.title}}
                                </button>
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" v-for="(miss,ind) in obj.missionsList" :key="ind" @click="missionWhereCopy=ind">{{miss}}</a>
                                </div>
                            </div>
                            <div class="dropdown" v-if="isNewStory" @click='storyWhereIcopy="newstory"'>
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">
                                    In questa storia
                                </button>
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" v-for="(miss,i) in missions" :key="i" @click="missionWhereCopy=i">{{miss.name}}</a>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" @click="copyActivity(currentActivity)">COPIA</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modals for widget choice -->
            <div class="modal fade" id="widgetModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Scegli un widget</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <button v-for="(title,index) in widgets" :key="index" type="button" class="list-group-item list-group-item-action" @click="changeWidget(index)">
                            {{title}} </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button"  class="btn btn-primary" @click="chooseWidget()">Scegli</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="deviceModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Scegli un device</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                        <button v-for="(name,index) in devices" :key="index" type="button" class="list-group-item list-group-item-action" @click="changeDevice(index)">
                        {{name}} </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button"  class="btn btn-primary" @click="chooseDevice()">Scegli</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modals for copying and moving missions -->
            <div class="modal fade" id="moveMissionModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Spostamento missione</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span>Scegli in quale storia spostare la missione </span>
                            <button v-for="(obj,index) in titles.privateList" :key="index" v-if="obj.title !== $('#inpTitle').val()" type="button" @click="storyWhereIcopy=obj.title" class="list-group-item list-group-item-action">
                                {{obj.title}} 
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" @click="moveMission(currentMission)">SPOSTA</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="copyMissionModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Copia di una missione</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span>Scegli in quale storia copiare la missione </span>
                            <button v-for="(obj,index) in titles.privateList" :key="index" type="button" @click="storyWhereIcopy=obj.title" class="list-group-item list-group-item-action">
                                {{obj.title}} 
                            </button>
                            <button v-for="(obj,ind) in titles.privateList" :key="ind" type="button" v-if="isNewStory" @click='storyWhereIcopy="newstory"' class="list-group-item list-group-item-action">
                                In questa storia 
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" @click="copyMission(currentMission)">COPIA</button>
                        </div>
                    </div>
                </div>
            </div>
        </div> 

        
    `,
    methods: {
        /*  ACTIVITIES MANAGEMENT   */
        addAnswer(e) {
            e.preventDefault();
            this.answerList.push($("#answer").val());
            $("#answer").prop("value", "");
        },
        addFacility(e) {
            e.preventDefault();
            this.facilitiesList.push($(`#facility`).val().trim());
            $(`#facility`).prop("value", "");
        },
        addDifficulty(e) {
            e.preventDefault();
            this.difficultiesList.push($(`#difficulty`).val().trim());
            $(`#difficulty`).prop("value", "");
        },
        addActivity(e) {   
            e.preventDefault();
            $(`#nextActivityCorrect option`).prop('disabled', false);
            $(`#nextActivityIncorrect option`).prop('disabled', false);
            if($('#saveActivity').val() == "Salva modifiche"){
                let widgetValue = "";

                if(this.currentWidget >= 0) widgetValue = this.widgets[this.currentWidget];
                this.missions[this.currentMission].activities[this.currentActivity].type =  $("#activitiesList li input:checked").val();
                this.missions[this.currentMission].activities[this.currentActivity].setting = $("#activitiesList li input[name='where']").val();
                this.missions[this.currentMission].activities[this.currentActivity].instructions = $("#activitiesList li textarea[name='instructions']").val();
                this.missions[this.currentMission].activities[this.currentActivity].widget = widgetValue;
                this.missions[this.currentMission].activities[this.currentActivity].question = $("#question").val();
                
                if(this.type == 'scelta multipla') {
                    this.missions[this.currentMission].activities[this.currentActivity].answers = this.answerList;
                    this.missions[this.currentMission].activities[this.currentActivity].correctAns = $('#answers:checked').val();
                }
                else if(this.type == 'domanda aperta') {
                    this.missions[this.currentMission].activities[this.currentActivity].answers = '';
                    this.missions[this.currentMission].activities[this.currentActivity].correctAns = $('#answer').val();
                }
                else {
                    this.missions[this.currentMission].activities[this.currentActivity].answers = '';
                    this.missions[this.currentMission].activities[this.currentActivity].correctAns = '';
                }
                this.missions[this.currentMission].activities[this.currentActivity].score = this.value;
                this.missions[this.currentMission].activities[this.currentActivity].goTo.ifCorrect.nextMission = $("#nextActivityCorrect").val().substring(0,1);
                this.missions[this.currentMission].activities[this.currentActivity].goTo.ifCorrect.nextActivity = $("#nextActivityCorrect").val().substring(2,3);
                this.missions[this.currentMission].activities[this.currentActivity].goTo.ifNotCorrect.nextMission = $("#nextActivityIncorrect").val().substring(0,1);
                this.missions[this.currentMission].activities[this.currentActivity].goTo.ifNotCorrect.nextActivity = $("#nextActivityIncorrect").val().substring(2,3);

                $('#activitiesForm h2').text(`Nuova attività`)
                $('#saveActivity').prop("value", "Salva attività");
                $('#chooseMission').show();
                $('label[for="chooseMission"]').show();
            }
            else {
                let widgetValue = "";
                if(this.currentWidget >= 0) widgetValue = this.widgets[this.currentWidget];
                //find the index of the mission we have to add the new activity
                let missionIndex = this.missions.findIndex(obj => obj.name === $('#chooseMission').val());
                let activityNumber = (this.missions[missionIndex].activities.length != 0)?this.missions[missionIndex].activities[this.missions[missionIndex].activities.length -1].number +1:0;
                
                let correctAnswer = '';
                if (this.type == 'scelta multipla') {
                    correctAnswer = $('#answers input:checked').val();
                }
                else if(this.type == 'domanda aperta') {
                    correctAnswer =  $('#answer').val();
                }

               
                let activity = {
                    number: activityNumber,
                    type: $("#activitiesList li input:checked").val(),
                    setting:  $("#activitiesList li input[name='where']").val(),
                    instructions: $("#activitiesList li textarea[name='instructions']").val(),
                    question: $("#question").val(),
                    answers: this.answerList,
                    correctAns: correctAnswer,
                    score: this.value,
                    isActive: true,
                    widget: widgetValue,
                    goTo: {
                        ifCorrect: {
                            nextMission: $("#nextActivityCorrect").val().substring(0,1),
                            nextActivity: $("#nextActivityCorrect").val().substring(2,3)
                        },
                        ifNotCorrect: {
                            nextMission: $("#nextActivityIncorrect").val().substring(0,1),
                            nextActivity: $("#nextActivityCorrect").val().substring(2,3)
                        }
                    }
                }
                this.missions[missionIndex].activities.push(activity);
                this.currentWidget = -1;
                this.value = 50;
            }     

            $('#activitiesForm')[0].reset();
            $("#buttonWidget").prop("value","Scegli");
            $("#infoWidget").text("");
            $("#infoWidget").css("display", "none");
            this.type = 'scelta multipla';
            this.answerList = [];
        },
        editActivity(index,misInd){
                this.answerList = [];
                this.currentMission = misInd;
                this.currentActivity = index;
                $(`#nextActivityCorrect option[value='-/-']`).prop('selected', true);
                $(`#nextActivityIncorrect option[value='-/-']`).prop('selected', true);
                $(`#nextActivityCorrect option`).prop('disabled', false);
                $(`#nextActivityIncorrect option`).prop('disabled', false);
                $(`#nextActivityCorrect option[value='${misInd}/${index}']`).prop('disabled', true);
                $(`#nextActivityIncorrect option[value='${misInd}/${index}']`).prop('disabled', true);

                //prevent the user to change the activity mission from this form
                $('#chooseMission').hide();
                $('label[for="chooseMission"]').hide();

                $("#activitiesList li input[value='"+this.missions[misInd].activities[index].type+"']").prop('checked', true);
                $("#activitiesList li input[name='where']").val(this.missions[misInd].activities[index].setting);
                $("#activitiesList li textarea[name='instructions']").val(this.missions[misInd].activities[index].instructions);
                
                $('#activitiesForm h2').text("Modifica l'attività "+ (parseInt(this.missions[misInd].activities[index].number) + 1))
                $('#saveActivity').prop("value", "Salva modifiche");

                $("#question").prop("value",this.missions[misInd].activities[index].question);
                
                // resume activity's type and answers list
                this.type = this.missions[misInd].activities[index].type;
                $('#answer').prop("value", "");
                if(this.type == 'scelta multipla') this.answerList = this.missions[misInd].activities[index].answers;
                else if (this.type == 'domanda aperta') $('#answer').prop("value", this.missions[misInd].activities[index].correctAns);

                //resume activity's score
                this.value = this.missions[misInd].activities[index].score;

                // resume activity's next tasks
                let missNum1 = this.missions[misInd].activities[index].goTo.ifCorrect.nextMission;
                let actNum1 = this.missions[misInd].activities[index].goTo.ifCorrect.nextActivity;
                if(missNum1 !== "-" && this.missions[missNum1].activities[actNum1]) 
                    $(`#nextActivityCorrect option[value='${missNum1}/${actNum1}']`).prop('selected', true);
                
                let missNum2 = this.missions[misInd].activities[index].goTo.ifNotCorrect.nextMission;
                let actNum2 = this.missions[misInd].activities[index].goTo.ifNotCorrect.nextActivity;
                if(missNum2 !== "-" && this.missions[missNum2].activities[actNum2]) 
                    $(`#nextActivityIncorrect option[value='${missNum2}/${actNum2}']`).prop('selected', true);
                 
                if(this.missions[misInd].activities[index].widget) {
                    $("#buttonWidget").prop("value","Cambia");
                    $("#infoWidget").text("Hai scelto il widget: " + this.missions[misInd].activities[index].widget);
                    $("#infoWidget").css("display", "inline");
                    this.currentWidget = this.widgets.indexOf(this.missions[misInd].activities[index].widget);
                }
        },
        moveActivity(index){
            this.copyActivity(index);

            $('#moveActivityModal').modal('hide');
            this.missions[this.currentMission].activities.splice(index,1);
        },
        copyActivity(index){
            //copying all the data of the activity
            var obj = Object.assign({}, this.missions[this.currentMission].activities[index]);
            
            let toStory = this.storyWhereIcopy;
            //if the title where i have to copy is the same of the story which i'm editing
            if(toStory === $('#inpTitle').val() || toStory === "newstory") {
                obj.number = (this.missions[this.missionWhereCopy].activities.length != 0)?this.missions[this.missionWhereCopy].activities.length:0;
                this.missions[this.missionWhereCopy].activities.push(obj);
                $('#copyActivityModal').modal('hide');
            }
            else{
                $.ajax({
                    type: "POST",
                    url: "/copyActivity?toStory="+toStory+"&toMiss="+this.missionWhereCopy,
                    data: obj,
                    cache: false,
                    success: (data) =>{
                        $('#copyActivityModal').modal('hide');
                    },
                    error: function (e) {
                        console.log("error",e);
                    }
                });
            }
        },
        deleteActivity(index,missIndex) {
             this.currentMission = missIndex;
             this.missions[missIndex].activities.splice(index,1);
             $('#activitiesForm')[0].reset();
             $('#activitiesForm h2').text(`Nuova attività`)
             $('#saveActivity').prop("value", "Salva attività");
             $("#buttonWidget").prop("value","Scegli");
             $("#infoWidget").text("");
             $("#infoWidget").css("display", "none");
             this.value = 50;
        },
        /*  WIDGET MANAGEMENT   */
        changeWidget(index) {
            this.currentWidget = index;
        },
        chooseWidget() {
            $('#widgetModal').modal('hide');
            $("#buttonWidget").prop("value", "Cambia");
            $("#infoWidget").text("Hai scelto il widget: " + this.widgets[this.currentWidget]);
            $("#infoWidget").css("display", "inline");
        },
        changeDevice(index) {
            this.currentDevice = index;
        },
        chooseDevice() {
            $('#deviceModal').modal('hide');
            $("#buttonDevice").prop("value", "Cambia");
            $("#infoDevice").text("Hai scelto il device: " + this.devices[this.currentDevice]);
            $("#infoDevice").css("display", "inline");
        },
        addWidget(e) {
            e.preventDefault();
            let data = new FormData($('#widgetsForm')[0]);
            let widgetName = $("#inpWidgetName").val()
            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/saveWidget?name="+widgetName,
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                success: (data) =>{
                    //emit event to update the home component stories list
                    $('#widgetsForm')[0].reset();
                    this.widgets.push(widgetName);
                },
                error: function (e) {
                    console.log("error");
                }
            });
        },
        /*  MISSION MANAGEMENT   */
        addMission(){
            //find the index for adding in real time the mission to the list of the modals
            if(!this.isNewStory){
                let index = this.titles.privateList.findIndex(x => x.title === $('#inpTitle').val());
                this.titles.privateList[index].missionsList.push("Missione "+(this.missions.length +1));
            }
            this.missions.push({name:"Missione "+(this.missions.length + 1),activities:[],isActive:false});
        },
        moveMission(index){
            this.copyMission(index,'move');

            $('#moveMissionModal').modal('hide');
            this.missions.splice(index,1);
            if(!this.isNewStory){
                let storyIndex = this.titles.privateList.findIndex(x => x.title === this.currentStory);
                this.titles.privateList[storyIndex].missionsList.splice(index,1);
            }
        },
        copyMission(index,val){

            let mission = jQuery.extend(true,{}, this.missions[index]);
            let toStory = this.storyWhereIcopy;
            let storyIndex;
            //if the title where i have to copy is the same of the story which i'm editing
            if(toStory === $('#inpTitle').val() || toStory === "newstory") {
                mission.name = "Missione "+ ((this.missions.length != 0)?this.missions.length+1:1);
                this.missions.push(mission);
                if(val || this.isNewStory){
                    console.log("Non devo inserire nell'array perchè sto spostando la storia/sto creando una nuova storia");
                }else{
                    storyIndex = this.titles.privateList.findIndex(n => n.title === this.currentStory);
                    this.titles.privateList[storyIndex].missionsList.push(mission.name);
                }
                $('#copyMissionModal').modal('hide');
            }
            else{
                if(val){
                    console.log("Non devo inserire nell'array perchè sto spostando la storia");
                }else{
                    //find the index of the story where i will copy the mission
                    storyIndex = this.titles.privateList.findIndex(n => n.title === this.storyWhereIcopy);
                    this.titles.privateList[storyIndex].missionsList.push(mission.name);
                }
                $.ajax({
                    type: "POST",
                    url: "/copyMission?toStory="+toStory,
                    data: mission,
                    cache: false,
                    success: (data) =>{
                        $('#copyMissionModal').modal('hide');
                    },
                    error: function (e) {
                        console.log("error",e);
                    }
                });
            }
        },
        deleteMission(index) {
             this.currentMission = index;
             this.missions.splice(index,1);
             //delete in real time the mission from the titles.privateList.missionsList(for the modals)
             if(!this.isNewStory){
                let titleIndex = this.titles.privateList.findIndex(x => x.title === $('#inpTitle').val());
                this.titles.privateList[titleIndex].missionsList.splice(index,1);
             }
             //needed if the activity form is filled with informations deleted
             $('#activitiesForm')[0].reset();
             $('#activitiesForm h2').text(`Nuova attività`)
             $('#saveActivity').prop("value", "Salva attività");
             $("#buttonWidget").prop("value","Scegli");
             $("#infoWidget").text("");
             $("#infoWidget").css("display", "none");
        },
        /*  MENU MANAGEMENT   */
        checkName(type) {
            let list, value, input, info;
            if(type == 'widget') {
                list = this.widgets;
                input = $("#inpWidgetName");
                value = $("#inpWidgetName").val();
                info =  $("#widgetInfo");
            } 
            else if(type == 'title') {
                list = [];
                this.titles.privateList.map(obj => {
                    list.push(obj.title);
                })
                this.titles.publicList.map(obj => {
                    list.push(obj.title);
                })

                input = $("#inpTitle");
                value = $("#inpTitle").val();
                info =  $("#titleInfo");
            }

            if(list.includes(value)) {
                input.css("background-color", "red");
                input.addClass('error');
                info.css("display", "inline");
                setTimeout(function() {
                    input.removeClass('error');
                }, 3000);    
                this.invalid = true;               
            }
            else {
                input.css("background-color", "white");
                info.css("display", "none");
            }
        },
        checkForm: function() {
            if(this.invalid) return;
            else if(!this.missions.some(el => el.isActive)){
                console.log("Sono entrato");
                $('#selMissErr').show();
                $('#selMissErr').removeClass('error').addClass('error');
                return;
            }
            let data = new FormData($('#editStoryForm')[0]);

            var originTitle = this.currentStory;
            var verifyInput = $('input[type=file]');
            var titleChanged = ($("#inpTitle").val() != originTitle && (originTitle != '')) ? true : false;

            data.append('missions',JSON.stringify(this.missions,null,2)); 

            data.append('facilities',JSON.stringify(this.facilitiesList));  
            data.append('difficulties',JSON.stringify(this.difficultiesList)); 

            data.append('originalTitle',JSON.stringify(originTitle));
            if(this.currentDevice > -1) 
                data.append('device',JSON.stringify(this.devices[this.currentDevice]));

            //verify if the files have been entered, if not i need to keep the old file name
            for(let i=0; i< verifyInput.length;i++){
                if(verifyInput.eq(i).val())console.log("Nuovo file inserito per",verifyInput.eq(i).attr('name'));
                else{
                    //removing the field as file and insert it as text
                    data.delete(verifyInput.eq(i).attr('name'));
                    data.append(verifyInput.eq(i).attr('name'),$(`#${verifyInput.eq(i).attr('id')} + p`).text());
                }   
            }
            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/saveStory?title="+$("#inpTitle").val()+"&originalTitle="+originTitle,
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                success: (data) =>{
                    //emit event to update the home component stories list
                    var story = JSON.stringify({titleMission:{title: $('#inpTitle').val(),missions:this.missions}, original: originTitle, changed: titleChanged});
                    this.$root.$emit('updateStories',story);
                    $('#editStoryForm')[0].reset();
                    $('#activitiesForm')[0].reset();
                    $('.infoForFile').text("");
                    $('#toHome').click();
                    this.isNewStory = false;
                },
                error: function (e) {
                    console.log("error");
                }
            });
            
        },
        showData(data) {
            Object.entries(data).map(item => {
                if(item[0] == "background" || item[0] == "pocketItemCss" || item[0] == "pocketItemJs") {
                    let id = $(`[name=${item[0]}`).eq(0).attr('id');
                    $(`#${id} + p`).text(item[1] );
                }
                else if(item[0] == "missions") {
                    this.missions = [];
                    for(let i = 0; i < item[1].length; i++) {
                        this.missions.push(item[1][i]);
                    }
                }
                else if(item[0] == "facilities") this.facilitiesList = item[1]
                else if(item[0] == "facilities") this.difficultiesList = item[1]
                else {
                    $("*[name ='"+item[0]+"'").val(item[1]);
                }
            })
        },
        show() {
            var modal = document.getElementById("graphModal");
            modal.style.display = "block";
            this.drawGraph();
            $("input, select, textarea ").prop("disabled", true);
            var span = document.getElementsByClassName("close")[0];
            span.onclick = function() { 
                modal.style.display = "none";
                d3.selectAll("svg > *").remove();
                $("input, select, textarea").prop("disabled", false);
            }
        },
        drawGraph(){
            var colors = d3.scaleOrdinal(d3.schemeCategory10);
            var svg = d3.select("svg"),
                width = 900,
                height = 600,
                node,
                link;

            var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(function(d) {return d.distance}).strength(1))
                .force("charge", d3.forceManyBody())
           //     .force("collide", d3.forceCollide(30))
                .force("center", d3.forceCenter(width / 2, height / 2));

            
            var graph = {nodes:[],links:[]};
            let indAct = 0, totAct = 0;
            let indMiss = 0;

            graph.nodes.push({id: "start", name: "START", r: 10});
            graph.nodes.push({id: "end", name: "END", r: 10});
            

            this.missions.map(item =>{
                if(item.isActive) {
                    item.activities.map(act => {
                        if(act.isActive) {
                            graph.nodes.push({mission:item.name,activity:act.number+1,id: indMiss.toString()+indAct, r: 7, name: "(M"+(indMiss+1)+", A"+(act.number+1)+")"});
                            let correct = act.goTo.ifCorrect, incorrect = act.goTo.ifNotCorrect;
                            if(indMiss.toString()+indAct == "00") 
                                graph.links.push({source: "start", target: "00", color: 'white', distance: 100});
                            
                            if(correct.nextActivity !== '-' /*&& this.missions[correct.nextMission].activities[correct.nextActivity]*/) {
                                if(correct.nextActivity == 'x') {
                                    graph.links.push({source: indMiss.toString()+indAct,target: 'end', color: 'green', distance: 100});
                                }
                                else {
                                    graph.links.push({source: indMiss.toString()+indAct,target: correct.nextMission.toString()+ correct.nextActivity, color: 'green', distance: 100});
                                }
                            }
                            else {
                                graph.nodes.push({name: "",id: indMiss.toString()+indAct+"-correct", r: 0.1});
                                graph.links.push({source: indMiss.toString()+indAct, target: indMiss.toString()+indAct+"-correct", color: 'green', distance: 50});
                            }
                            if(incorrect.nextActivity !== '-' /*&& this.missions[incorrect.nextMission].activities[incorrect.nextActivity]*/) {
                                if(incorrect.nextActivity == 'x'){
                                    graph.links.push({source: indMiss.toString()+indAct,target: 'end', color: 'red', distance: 100});
                                }
                                else {
                                    graph.links.push({source: indMiss.toString()+indAct,target: incorrect.nextMission.toString()+ incorrect.nextActivity, color: 'red', distance: 100});
                                }
                            }
                            else {
                                graph.nodes.push({name: "",id: indMiss.toString()+indAct+"-incorrect", r: 0.1});
                                graph.links.push({source: indMiss.toString()+indAct, target: indMiss.toString()+indAct+"-incorrect", color: 'red', distance: 50});
                            }

                            indAct++;
                            totAct++;
                        }
                    })
                }
                indMiss++;
                indAct = 0;
            })
         
            /*
            let range = 700/totAct;
            console.log(range);
            let i = 0;
            graph.nodes.forEach(function(d){
                if(d.id == "start") { d.x = 50; d.y = 300; }
                else if(d.id == "end") { d.x = 750; d.y = 300}
                else {
                    if(d.name){
                        d.x = Math.floor(Math.random()*range) + (range*i) + 50;
                        d.y = Math.floor(Math.random()*500) + 50;
                        i++;
                        console.log(d.x, d.y)
                    }
                }
            })*/
            /*
            graph.links.forEach(function(d){
                if(d.distance == 100) {
                    console.log(d.source.x);
                    d.distance = Math.sqrt(Math.pow(d.source.x - d.target.x, 2) + Math.pow(d.source.y - d.target.y, 2));
                    console.log(d.distance);
                } 
            })
            */
            //for making arrows
            svg.append('svg:defs')
            .selectAll(".link")
            .data(graph.links)
            .enter()
            .append("svg:marker") 
            .attr("class", "triangle")
            .attr("id", function(d){ return "arrow" + d.color})
            .attrs({
                'viewBox':'-0 -5 10 10',
                'refX':10,
                'refY':0,
                'orient':'auto',
                'markerWidth':13,
                'markerHeight':13,
                'xoverflow':'visible',
                'color': 'white'
            })
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .style("fill", function(d){
                return(d.color)
            })     
            .style('stroke','none');
            
            update(graph.links, graph.nodes);

            function update(links, nodes) {
                link = svg.selectAll(".link")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("class", "link")
                    .attr('marker-end',function(d){ return "url(#arrow" + d.color +')'})
                    .style("stroke", function (l) {return l.color});

                node = svg.selectAll(".node")
                    .data(nodes)
                    .enter()
                    .append("g")
                    .attr("class", "node")
                    
                 /*   .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended)
                    )*/;
                                

                node.append("circle")
                    .attr("r", function(d) {return d.r})
                    .style("fill", function (d, i) {return colors(i)});

                node.append("text")
                    .attr("font-size", "1em")
                    .style("fill", "white")
                    .text(function (d) { return d.name; });

                simulation
                    .nodes(nodes)
                    .on("tick", ticked);

                simulation.force("link")
                    .links(links); 
            }

            function ticked() {
                
                link
                    .attr("x1", function (d) {return d.source.x})
                    .attr("y1", function (d) {return d.source.y})
                    .attr("x2", function (d) {return d.target.x - 2})
                    .attr("y2", function (d) {return d.target.y - 2});
    
                node
                    .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});
            }

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart()
                d.fx = d.x;
                d.fy = d.y;
            }
            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }
            
            //Dopo il drag riporta al centro tutti i nodi,inutile 
            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = undefined;
                d.fy = undefined;
            } 
        }
    },
    computed: {
        total: function () {
        return this.value 
      }
    },
    activated() {
        $('#editStoryForm')[0].reset();
        $('#activitiesForm')[0].reset();
        this.missions = [{name:"Missione 1",activities:[],isActive:false}];
        this.currentActivity = 0;
        this.currentStory = '';
        $('#selMissErr').hide();
        bus.$emit('ready','pronto'); 
        bus.$once('story',(story) =>{
            this.currentStory = story;
            this.isNewStory = true;
            if(this.currentStory) {
                this.isNewStory = false;
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    cache: false,
                    url: "/getStory?title="+this.currentStory+"&group=private",
                    success: (data) =>{
                     // fill form with json's fields
                        this.showData(data);
                    },
                    error: function (e) {
                        console.log("error in get story",e);
                    }
                });
            }
        })
        bus.$on('titles', (response) => { this.titles = response});


        $('#activitiesForm, #editStoryForm, #showGraph, #insertFacility, #insertDifficulty').keydown(function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        });
    },
    created() {
        /* retrieve widgets' names */
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/getWidgets",
            success: (data) =>{
                this.widgets = data.widgets;
                this.devices = data.devices;
            },
            error: function (e) {
                console.log("error in get widgets names",e);
            }
        });
    }
}