import { bus } from './index.js';

export default {
    name: 'editMenu',
    data() {
        return{
            groupNum: 1,
            groups: ["Gruppo 1"],
            currentGroup: 0,
            first: { mission: [], activity: []},
            missions: [{name: "Missione 1", activities:[], isActive:false}],
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
            <h1 id="title"> Editor </h1>
            <p>Inserisci i dati per creare/modificare la tua storia </p>
            <button id="submitBtn" @click="checkForm">FINITO</button><span id="selMissErr">Nessuna missione è stata attivata</span>
            <form id="editStoryForm">
                <ul>
                    <li>
                        <input type="checkbox" id="accessibility" name="accessibility" value="true">
                        <label for="accessibility" class="mainLabel">STORIA ACCESSIBILE</label><br>
                        <label for="age" class="mainLabel">Scegli il range di età: </label>
                        <select name="age" id="age" class="selection">
                            <option>6-10</option>
                            <option>10-14</option>
                            <option>14-18</option>
                        </select><br>
                        <label for="groups" class="mainLabel group">Numero di gruppi:</label>
                        <input id="groups" type="range" min="1" max="5" step="1"  v-model="groupNum" name="groups" @click="changeGroups"/>
                        <span v-text="groupNum"></span>
                    </li>
                    <li>
                        <label for="inpTitle" class="mainLabel">Inserisci il titolo: </label>
                        <input type="text" name="title" id="inpTitle" v-on:keyup="checkName('title')" required/>
                        <br><p id="titleInfo"> Una storia con questo titolo esiste già</p>
                    </li>
                    <li>
                        <label for="inpSett" class="mainLabel">Inserisci l'ambientazione:</label>
                        <input type="text" name="setting" id="inpSett" />
                    </li>
                    <li>
                        <label for="inpBack" class="mainLabel">Inserisci lo sfondo:</label>
                        <input  type="file" name="background" id="inpBack" accept="image/*" />
                        <p class="infoForFile"></p>
                    </li>
                    <li>
                        <label for="inpDescr" class="mainLabel">Inserisci una breve descrizione iniziale alla storia:</label><br>
                        <textarea id="inpDescr" name="description" rows="3" cols="40"></textarea>
                    </li>
                    <li>
                        <label for="buttonDevice" class="mainLabel">Scegli il dispositivo che il cellulare rappresenterà:</label>
                        <input type="button" id="buttonDevice" data-toggle="modal" data-target="#deviceModal" value="Scegli"/>
                        <p id="infoDevice" style="display:none"> </p>
                    </li>
                    <li>
                        <label for="inpIntr" class="mainLabel">Inserisci l'introduzione della tua storia:</label><br>
                        <textarea id="inpIntr" name="introduction" rows="3" cols="40"></textarea>
                    </li>
                    <li>
                        <label for="inpConcl" class="mainLabel">Inserisci la conclusione della tua storia:</label><br>
                        <textarea id="inpConcl" name="conclusion" rows="3" cols="40"></textarea>
                    </li>
                    <li>    
                        <h3 style="display:inline-block">Missioni</h3>&nbsp;&nbsp;                            

                        <ul id="missionSaved">
                            <li v-for="(mission,index) in missions" :key="index">
                                <label for="missActive" style="display:none">Seleziona l'attività se intendi renderla attiva</label>
                                <input type="checkbox" name="isActive" :checked="mission.isActive" @click="mission.isActive = !mission.isActive" />&emsp;
                                {{mission.name}}&emsp;
                                <span class="icon-group">
                                    <i class="fas fa-cut" @click="currentMission = index" data-toggle="modal" data-target="#moveMissionModal" v-if="index != 0"></i>&nbsp;&nbsp;
                                    <i class="fas fa-clone"  @click="currentMission = index" data-toggle="modal" data-target="#copyMissionModal"></i>&nbsp;&nbsp;
                                    <i class="fas fa-trash-alt" @click="deleteMission(index)" v-if="index != 0"></i>
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
                    <li class="addIcons">
                        <span style="font-size:30px;cursor:pointer"  @click="addMission"><i class="fas fa-chess-bishop"></i>&nbsp;&nbsp;Aggiungi missione</span><br>
                        <span style="font-size:30px;cursor:pointer" @click="openNav('activity')"><i class="fas fa-chess-pawn"></i>&nbsp;&nbsp;Aggiungi attività</span><br>
                        <span style="font-size:30px;cursor:pointer" @click="openNav('widget')"><i class="fas fa-chess-rook"></i>&nbsp;&nbsp;Aggiungi widget</span>
                    </li>
                    <li>
                        <h3>Percorsi</h3>
                        <p v-for="(group,ind) in groups" :key="ind" style="font-size:30px;cursor:pointer" @click="openNav('percorsi', ind)"><i class="fas fa-map-signs"></i>&nbsp;{{group}}</p>
                    </li>
                    <li>
                        <h3>Facilitazioni</h3>
                        <label for="facility" class="mainLabel">Inserisci una facilitazione:</label><br>                 
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
                        <label for="difficulty" class="mainLabel">Inserisci una difficoltà:</label><br>                 
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
           
            <!-- menu form activities -->
            <div id="activitiesNav" class="overlay">
                <a href="javascript:void(0)" class="closebtn" @click="closeNav('activity')">&times;</a>
                <div class="overlay-content">
                <form id="activitiesForm" @submit="addActivity">
                <h2>Nuova attività</h2>
                <ul id="activitiesList">
                    <li>
                        <label for="chooseMission" class="mainLabel">Scegli in quale missione aggiungerla: </label>
                        <select name="mission" id="chooseMission" class="selection">
                            <option v-for="(mission,index) in missions" :key="index" :value="mission.name"> {{mission.name}}</option>
                        </select>
                        <h5 class="info">Scegli il tipo dell'attività : </h5>
                        <input id="multipleChoice" type="radio" v-model="type" value="scelta multipla" name="activityTypeGroup" checked/>
                        <label for="multipleChoice" class="mainLabel">Scelta multipla</label><br>
                        <input id="openQuest" type="radio" v-model="type" value="domanda aperta" name="activityTypeGroup" />
                        <label for="openQuest" class="mainLabel">Domanda aperta</label><br>
                        <input id="figur" type="radio" v-model="type" value="figurativa" name="activityTypeGroup" />
                        <label for="figur" class="mainLabel">Figurativa</label><br>
                        <input id="valutabile" type="radio" v-model="type" value="valutabile" name="activityTypeGroup"  />
                        <label for="valutabile" class="mainLabel">Valutabile</label>
                        <br>
                        <label for="where" class="info">Dove si svolge l'attività?(ambientazione)</label>
                        <input type="text" id="where" name="where" />

                        <label for="instructions" class="info">Spiegazione per lo svolgimento dell'attività:</label><br>
                        <textarea id="instructions" name="instructions" rows="3" cols="40"></textarea>

                        <div id="questionDiv">
                            <label for="question" class="mainLabel">Inserisci la domanda:</label><br>
                            <input id="question" type="text" name="question" /><br>
                    
                            <div v-if="type=='scelta multipla'">
                                <label for="answer" class="mainLabel">Inserisci una risposta:</label><br>
                                <input id="answer" type="text" name="answer" @keyup.enter="addAnswer(event)"/>
                                <button id="insertAnswer" @click="addAnswer(event)">Aggiungi risposta</button>
                                <p v-if="answerList.length">Seleziona la risposta corretta</p>
                                <ul id="answers">
                                    <li v-for="(answer,index) in answerList" :key="index">
                                    <input type="radio" :id="index" name="answer" :value="answer" required :checked="missions[currentMission].activities[currentActivity].correctAns===answer">
                                    <label :for="index"> {{answer}} </label>
                                    &nbsp;&nbsp;
                                    <i class="fas fa-trash-alt" @click="answerList.splice(index,1)"></i>
                                    </li>
                                </ul>
                            </div>
                            <div v-else-if="type=='domanda aperta' || type=='figurativa'">
                                <label for="answer" class="mainLabel">Inserisci una risposta:</label><br>
                                <input id="answer" type="text" name="answer"/>
                            </div>
                            <div>
                                <h5 class="info">Scegli il tipo di oggetto da inserire: </h5>
                                <div id="inputObject">
                                    <ul>
                                        <li>
                                            <input id="text" type="radio" value="text" name="inputObjectGroup" :disabled="type!=='valutabile'" checked />
                                            <label for="text">Campo di testo</label>
                                        <li>
                                        <li>
                                            <input id="file" type="radio" value="file" name="inputObjectGroup" :disabled="type!=='valutabile'" />
                                            <label for="file">Scelta file</label>
                                        </li>
                                    </ul>
                                </div>
                                <h5 class="info">Inserisci un messaggio da visualizzare nel momento in cui l'utente attende che la sua risposta venga valutata: </h5>
                                <input id="waitMsg" type="text" name="inputObjectGroup" :disabled="type!=='valutabile'" />
                                <label for="waitMsg" style="display:none">Messaggio</label>
                            </div>
                            

                            <label for="score" class="info">Inserisci un punteggio da assegnare:</label><br>
                            <input id="score" type="range" min="10" max="100" step="5"  v-model="value" name="score"/>
                            <span v-text="value" id="scoreValue"></span>

                        </div>
                        
                
                        <h5 class="info" style="display:inline">Scegli un widget per questa attività: </h5>
                        <input type="button" id="buttonWidget" data-toggle="modal" data-target="#widgetModal" value="Seleziona" :disabled="type!=='figurativa'" required/>
                        <br><p id="infoWidget" style="display:none"> </p>
                    </li>
                </ul>
                <input id="saveActivity" type="submit" value="Salva attività" />
            </form>
                </div>
            </div>
            
            <!-- menu form widgets -->

            <div id="widgetNav" class="overlay">
                <a href="javascript:void(0)" class="closebtn" @click="closeNav('widget')">&times;</a>
                <div class="overlay-content">
                <form id="widgetsForm" @submit="addWidget">
                    <h2>Nuovo widget</h2>

                    <h5 >Crea un nuovo widget: </h5>
                    <label for="inpWidgetName">Nome del widget:</label>
                    <input type="text" id="inpWidgetName" name="name" v-on:keyup="checkName('widget')" required/>
                    <p id="widgetInfo"> Un widget con questo nome esiste già</p>

                    <label for="inpWidgetCss">Aggiungi un file CSS</label>
                    <input type="file" name="widgetCss" id="inpWidgetCss" accept="text/css" required/>
                        
                    <label for="inpWidgetJs">Aggiungi un file JS</label>
                    <input type="file" name="widgetJs" id="inpWidgetJs" accept=".js" required/>
                        
                    <input id="saveWidget" type="submit" value="Salva widget" />
                </form>
                </div>
            </div>


            <!-- menu for paths -->

                <div class="modal fade" id="graphModal" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document" style="max-width: 90%">
                        <div class="modal-content">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="left: 1rem !important">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <svg></svg>
                        </div>
                    </div>
                </div>

                

            <div id="pathNav" class="overlay">
                <a href="javascript:void(0)" class="closebtn" @click="closeNav('path')">&times;</a>
                <div class="overlay-content">
                    <input type="button" id="buttonGraph" data-toggle="modal" data-target="#graphModal" value="Grafo attività"/>
                    <ul id="missionsList">
                        <li>
                            <p>Scegli l'attività da cui partire: </p>
                            <select id="firstAct" class="selection" name="firstAct"  @click="changeFirstAct()">
                                <option value="-/-" > Missione -  Attività -  </option> 
                                <template v-for="(mission, indMiss) in missions" :key="indMiss"> 
                                    <option v-for="activity in mission.activities" :value="indMiss+'/'+activity.number"> 
                                    {{mission.name}} Attività {{activity.number + 1}}
                                    </option>
                                </template>
                                <option value="x/x" > Conclusione </option> 
                            </select>
                        </li>
                        <li v-for="(mission,index) in missions" :key="index">
                            {{mission.name}}&emsp;
                            <ul id="activitiesList" v-if="mission.activities.length != 0">
                                <li :id="'missionDiv'+index" v-for="(activity,ind) in mission.activities" :key="ind">
                                <details>
                                    <summary>Attività {{parseInt(activity.number) + 1}}</summary>
                                    <p>Scegli l'attività successiva: </p>
                                    <ul>
                                    <li>
                                        <label :for="'rightAct'+index+'_'+ind"> in caso di risposta corretta</label><br>
                                        <select :id="'rightAct'+index+'_'+ind" class="selection" name="nextActivityCorrect"  @click="changeNextCorrect(index, ind)">
                                            <option value="-/-" > Missione -  Attività -  </option> 
                                            <template v-for="(mission, indMiss) in missions" :key="indMiss"> 
                                            <option v-for="activity in mission.activities" :value="indMiss+'/'+activity.number"> 
                                            {{mission.name}} Attività {{(activity.number + 1)}}
                                            </option>
                                            </template>
                                            <option value="x/x" > Conclusione </option> 
                                        </select>
                                    </li>
                                    <li>
                                        <label :for="'wrongAct'+index+'_'+ind"> in caso di risposta errata</label><br>
                                        <select :id="'wrongAct'+index+'_'+ind" class="selection" name="nextActivityIncorrect" @click="changeNextIncorrect(index, ind)">
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
                                </details>
                                </li>
                            </ul>
                            <p v-else>Nessuna attività per questa missione </p>
                        </li>
                    </ul>
                </div>
            </div>

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
                            <button type="button" v-if="isNewStory" @click='storyWhereIcopy="newstory"' class="list-group-item list-group-item-action">
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
        openNav(navValue, index) {
            /* this way underlying page does not scroll */
            $('body').css("overflow", "hidden")
            $('body').css("position", "fixed")
            if(navValue == 'activity')
                document.getElementById("activitiesNav").style.width = "100%";
            else if(navValue == 'widget')
                document.getElementById("widgetNav").style.width = "100%";
            else {
                document.getElementById("pathNav").style.width = "100%";
                this.currentGroup = index;

                console.log('first',this.first)
                let firstMiss = this.first.mission[index];
                let firstAct = this.first.activity[index];
                if(firstMiss) 
                    $(`#firstAct option[value='${firstMiss}/${firstAct}']`).prop('selected', true);
                else 
                    $(`#firstAct option[value='-/-']`).prop('selected', true);

                // resume activity's next tasks
                for(let i=0; i < this.missions.length; i++) {
                    for(let j=0; j < this.missions[i].activities.length; j++) {
                        let activity = this.missions[i].activities[j];

                        let missNum1 = activity.goTo.ifCorrect.nextMission[index];
                        let actNum1 = activity.goTo.ifCorrect.nextActivity[index];
                        if(missNum1) 
                            $(`#rightAct${i}_${j} option[value='${missNum1}/${actNum1}']`).prop('selected', true);
                        else 
                            $(`#rightAct${i}_${j} option[value='-/-']`).prop('selected', true);

                        let missNum2 = activity.goTo.ifNotCorrect.nextMission[index];
                        let actNum2 = activity.goTo.ifNotCorrect.nextActivity[index];
                        if(missNum2) 
                            $(`#wrongAct${i}_${j} option[value='${missNum2}/${actNum2}']`).prop('selected', true);
                        else 
                            $(`#wrongAct${i}_${j} option[value='-/-']`).prop('selected', true);
                    }
                }
                
            }
        },
        closeNav(navValue) {
            $('body').css("overflow", "visible")
            $('body').css("position", "static")

            if(navValue == 'activity') {
                $('#activitiesForm')[0].reset();
                $('#activitiesForm h2').text(`Nuova attività`)
                $('#saveActivity').prop("value", "Salva attività");
                $('#chooseMission').show();
                $('label[for="chooseMission"]').show();
                $('#activitiesForm')[0].reset();
                $("#buttonWidget").prop("value","Scegli");
                $("#infoWidget").text("");
                $("#infoWidget").css("display", "none");
                this.type = 'scelta multipla';
                this.answerList = [];
                document.getElementById("activitiesNav").style.width = "0%";
            }
            else if(navValue == 'widget')
                document.getElementById("widgetNav").style.width = "0%";
            else
                document.getElementById("pathNav").style.width = "0%";
        },
        /* change groups' number */
        changeGroups() {
            this.groups = [];
            for(let i = 0; i < this.groupNum; i++) {
                this.groups.push('Gruppo '+(i+1));
            }
        },
        /*  ACTIVITIES MANAGEMENT   */
        addAnswer(e) {
            e.preventDefault();
            if($("#answer").val())
                this.answerList.push($("#answer").val().trim());
            $("#answer").prop("value", "");
        },
        addFacility(e) {
            e.preventDefault();
            if($(`#facility`).val().trim())
                this.facilitiesList.push($(`#facility`).val().trim());
            $(`#facility`).prop("value", "");
        },
        addDifficulty(e) {
            e.preventDefault();
            if($(`#difficulty`).val().trim())
                this.difficultiesList.push($(`#difficulty`).val().trim());
            $(`#difficulty`).prop("value", "");
        },
        changeFirstAct() {
            let group = this.currentGroup;
            this.first.mission[group] = $('#firstAct').val().substring(0,1);
            this.first.activity[group] = $('#firstAct').val().substring(2,3);
        },
        changeNextCorrect(missInd, actInd) {
            $(`#rightAct${missInd}_${actInd} option[value='${missInd}/${actInd}']`).prop('disabled', true);
            /* capture next mission/activity selection*/
            let group = this.currentGroup;
            let currentAct =  this.missions[missInd].activities[actInd];
            currentAct.goTo.ifCorrect.nextMission[group] = $(`#rightAct${missInd}_${actInd}`).val().substring(0,1);
            currentAct.goTo.ifCorrect.nextActivity[group] = $(`#rightAct${missInd}_${actInd}`).val().substring(2,3);
        },
        changeNextIncorrect(missInd, actInd) {
            let group = this.currentGroup;
            let currentAct =  this.missions[missInd].activities[actInd];
            currentAct.goTo.ifNotCorrect.nextMission[group] = $(`#wrongAct${missInd}_${actInd}`).val().substring(0,1);
            currentAct.goTo.ifNotCorrect.nextActivity[group] = $(`#wrongAct${missInd}_${actInd}`).val().substring(2,3);
        },
        addActivity(e) {   
            e.preventDefault();
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
                    this.missions[this.currentMission].activities[this.currentActivity].correctAns = $('#answers input:checked').val();
                }
                else {
                    this.missions[this.currentMission].activities[this.currentActivity].answers = '';
                    this.missions[this.currentMission].activities[this.currentActivity].correctAns = $('#answer').val();
                }
                if(this.type == 'valutabile') {
                    this.missions[this.currentMission].activities[this.currentActivity].inputType = $('#inputObject input:checked').val();
                    this.missions[this.currentMission].activities[this.currentActivity].waitMsg = $('#waitMsg').val();
                }
                /* remove widget if type not figurative */
                if(this.type !== 'figurativa') {
                    this.missions[this.currentMission].activities[this.currentActivity].widget = "";
                }
                this.missions[this.currentMission].activities[this.currentActivity].score = this.value;
    
            }
            else {
                let widgetValue = "";
                if(this.currentWidget >= 0) widgetValue = this.widgets[this.currentWidget];
                
                //find the index of the mission we have to add the new activity
                let missionIndex = this.missions.findIndex(obj => obj.name === $('#chooseMission').val());
                let activityNumber = (this.missions[missionIndex].activities.length != 0)?this.missions[missionIndex].activities[this.missions[missionIndex].activities.length -1].number +1:0;
                
                let correctAnswer = '', inputType = '', message = '';
                if (this.type == 'scelta multipla') {
                    correctAnswer = $('#answers input:checked').val();
                }
                else {
                    correctAnswer =  $('#answer').val();
                }

                if(this.type == 'valutabile') {
                    inputType = $('#inputObject input:checked').val();
                    message = $('#waitMsg').val();
                }
                let activity = {
                    number: activityNumber,
                    type: $("#activitiesList li input:checked").val(),
                    setting:  $("#activitiesList li input[name='where']").val(),
                    instructions: $("#activitiesList li textarea[name='instructions']").val(),
                    question: $("#question").val(),
                    answers: this.answerList,
                    correctAns: correctAnswer,
                    inputType: inputType,
                    score: this.value,
                    isActive: true,
                    widget: widgetValue,
                    waitMsg: message,
                    goTo: {
                        ifCorrect: {
                            nextMission: [],
                            nextActivity: []
                        },
                        ifNotCorrect: {
                            nextMission: [],
                            nextActivity: []
                        }
                    }
                }

                this.missions[missionIndex].activities.push(activity);
                this.currentWidget = -1;
                this.value = 50;
            } 
           
            this.closeNav('activity');
        },
        editActivity(index,misInd){
                this.openNav('activity')
                this.answerList = [];
                this.currentMission = misInd;
                this.currentActivity = index;

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
                if(this.type == 'scelta multipla') {
                    console.log(this.missions[misInd].activities[index].correctAns)
                    this.answerList = this.missions[misInd].activities[index].answers;
                }
                else $('#answer').prop("value", this.missions[misInd].activities[index].correctAns);
                
                if(this.type == 'valutabile') {
                    let val = this.missions[misInd].activities[index].inputType;
                    $(`#inputObject li input[value='${val}']`).prop("checked", true);
                    $("#waitMsg").prop("value",this.missions[misInd].activities[index].waitMsg);
                }
                //resume activity's score
                this.value = this.missions[misInd].activities[index].score;

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
                    url: "/Editor/copyActivity?toStory="+toStory+"&toMiss="+this.missionWhereCopy,
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
            $("#infoDevice").css("display", "block");
        },
        addWidget(e) {
            e.preventDefault();
            this.closeNav('widget')
            let data = new FormData($('#widgetsForm')[0]);
            let widgetName = $("#inpWidgetName").val()
            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/Editor/saveWidget?name="+widgetName,
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
                    url: "/Editor/copyMission?toStory="+toStory,
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
                value = $("#inpWidgetName").val().trim();
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
                value = $("#inpTitle").val().trim();
                info =  $("#titleInfo");
            }

            if(list.includes(value)) {
                input.addClass('error');
                info.css("display", "inline");
                this.invalid = true;               
            }
            else {
                info.css("display", "none");
                input.removeClass('error');
                this.invalid = false;    
            }
        },
        checkForm: function() {
            if(this.invalid) return;
            //if no mission is active
            else if(!this.missions.some(el => el.isActive)){
                $('#selMissErr').show();
                $('#selMissErr').removeClass('error').addClass('error');
                return;
            }
            let data = new FormData($('#editStoryForm')[0]);

            var originTitle = this.currentStory;
            var verifyInput = $('input[type=file]');
            var titleChanged = ($("#inpTitle").val() != originTitle && (originTitle != '')) ? true : false;

            data.append('firstActivity',JSON.stringify(this.first,null,2)); 
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
                url: "/Editor/saveStory?title="+$("#inpTitle").val()+"&originalTitle="+originTitle,
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
                    $(`#${id} + p`).text(item[1]);
                }
                else if(item[0] == "accessibility") {
                    $('#accessibility').prop('checked', true);
                }
                else if(item[0] == "groups") {
                    this.groupNum = item[1];
                    this.groups = [];
                    for(let i = 0; i < this.groupNum; i++) {
                        this.groups.push('Gruppo ' + (i+1))
                    }
                }
                else if(item[0] == "firstActivity") {
                    this.first.mission = item[1].mission;
                    this.first.activity = item[1].activity;
                }
                else if(item[0] == "missions") {
                    this.missions = [];
                    for(let i = 0; i < item[1].length; i++) {
                        this.missions.push(item[1][i]);
                    }
                }
                else if(item[0] == "device") {
                
                    for(let i = 0; i < this.devices.length; i++ ) {
                        if(this.devices[i] == item[1]) { 
                            $("#infoDevice").text("Hai scelto il device: " + this.devices[i]);
                            $("#infoDevice").css("display", "block");
                            this.currentDevice = i; 
                        }
                    }
                }
                else if(item[0] == "facilities") this.facilitiesList = item[1]
                else if(item[0] == "difficulties") this.difficultiesList = item[1]
                else {
                    $("*[name ='"+item[0]+"'").val(item[1]);
                }
            })
        },
        show() {
            $("svg").empty();

            this.drawGraph();
            var span = document.getElementsByClassName("close")[0];
            span.onclick = function() { 
                $('#graphModal').modal('hide');
                d3.selectAll("svg > *").remove();
            }
        },
        drawGraph(){
            var colors = d3.scaleOrdinal(d3.schemeCategory10);
            var svg = d3.select("svg").attr("width", $(window).width()/*900*/).attr("height", 600),
                node,
                link;

            // compute current activities' graph
            var graph = {nodes:[],links:[]};
            let indAct = 0, totAct = 0;
            let indMiss = 0;
            let group = this.currentGroup;

            graph.nodes.push({id: "start", name: "START", r: 10});
            graph.nodes.push({id: "end", name: "END", r: 10});

            this.missions.map(item =>{
                totAct += item.activities.length
            })

            let firstId ;
            if(this.first.mission) 
                firstId = this.first.mission[group].toString() + this.first.activity[group];
            
            console.log('group', group, 'first', firstId)
            this.missions.map(item =>{
                if(item.isActive) {
                    item.activities.map(act => {
                        if(act.isActive) {
                            graph.nodes.push({mission:item.name,activity:act.number+1,id: indMiss.toString()+indAct, r: 7, name: "(M"+(indMiss+1)+", A"+(act.number+1)+")"});
                            let correct =  Object.assign({},act.goTo.ifCorrect), incorrect =  Object.assign({},act.goTo.ifNotCorrect);
                          
                            if(indMiss.toString()+indAct == firstId) 
                                graph.links.push({source: "start", target: firstId, color: 'white', x1:0, y1:0, x2:0, y2:0});

                            if(correct.nextActivity[group] && correct.nextActivity[group]!== '-' ) {
                                if(correct.nextActivity[group] == 'x') {
                                    graph.links.push({source: indMiss.toString()+indAct,target: 'end', color: 'green', x1:0, y1:0, x2:0, y2:0});
                                }
                                else {
                                    if(this.missions[correct.nextMission[group]].activities[correct.nextActivity[group]].isActive)
                                    graph.links.push({source: indMiss.toString()+indAct,target: correct.nextMission[group].toString()+ correct.nextActivity[group], color: 'green', x1:0, y1:0, x2:0, y2:0});
                                }
                            }
                            else {
                                graph.nodes.push({name: "",id: indMiss.toString()+indAct+"-correct", r: 0.1});
                                graph.links.push({source: indMiss.toString()+indAct, target: indMiss.toString()+indAct+"-correct", color: 'green', x1:0, y1:0, x2:0, y2:0});
                            }
                            if(incorrect.nextActivity[group] && incorrect.nextActivity[group]!== '-') {
                                if(incorrect.nextActivity[group] == 'x'){
                                    let exists = false;
                                    graph.links.forEach(function(d){
                                        if(d.source == indMiss.toString()+indAct && d.target == 'end') {
                                            d.color = 'white';
                                            exists = true;
                                        }
                                    })
                                    if(!exists)
                                    graph.links.push({source: indMiss.toString()+indAct,target: 'end', color: 'red', x1:0, y1:0, x2:0, y2:0});
                                }
                                else if(this.missions[incorrect.nextMission[group]].activities[incorrect.nextActivity[group]].isActive) {
                                    let exists = false;
                                    graph.links.forEach(function(d){
                                        if(d.source == indMiss.toString()+indAct && d.target == incorrect.nextMission[group].toString()+ incorrect.nextActivity[group]) {
                                            d.color = 'white';
                                            exists = true;
                                        }
                                    })
                                    if(!exists)
                                    graph.links.push({source: indMiss.toString()+indAct,target: incorrect.nextMission[group].toString()+ incorrect.nextActivity[group], color: 'red', x1:0, y1:0, x2:0, y2:0});
                                }
                            }
                            else {
                                graph.nodes.push({name: "",id: indMiss.toString()+indAct+"-incorrect", r: 0.1});
                                graph.links.push({source: indMiss.toString()+indAct, target: indMiss.toString()+indAct+"-incorrect", color: 'red', x1:0, y1:0, x2:0, y2:0});
                            }

                            indAct++;
                        }
                    })
                }
                indMiss++;
                indAct = 0;
            })
         
       
            let range = ($(window).width() - 80)/totAct;
            let i = 0;

            graph.nodes.forEach(function(d){
                if(d.id == "start") { d.x = 40; d.y = 300; }
                else if(d.id == "end") { d.x = $(window).width() - 40; d.y = 300}
                else {
                    if(d.name){
                        d.x = Math.floor(Math.random()*range) + (range*i) + 40;
                        d.y = Math.floor(Math.random()*500) + 50;
                        i++;
                    }
                    else {
                        d.x = 0; d.y = 0; 
                    }
                }
            })

            graph.links.forEach(function(d) {
                if(d.name != "") {
                        graph.nodes.forEach( n => {
                            if(n.id == d.source) { d.x1 = n.x, d.y1 = n.y}
                            if(n.id == d.target) {d.x2 = n.x; d.y2 = n.y}
                        })

                        if(d.target.split('-')[1] == "correct") {
                            d.x2 = d.x1 + 50;
                            d.y2 = d.y1 + 50;
                        }
                        if(d.target.split('-')[1] == "incorrect" ) {
                            d.x2 = d.x1 + 50;
                            d.y2 = d.y1 - 50;
                        }
                }
            })
            
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
                node = svg.selectAll(".node")
                    .data(nodes)
                    .enter()
                    .append("g")
                    .attr("class", "node");                                

                node.append("circle")
                    .attr("r", function(d) {return d.r})
                    .style("fill", function (d, i) {return colors(i)});

                node.append("text")
                    .attr("font-size", "1em")
                    .style("fill", "white")
                    .text(function (d) { return d.name; });
                    
                node.attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")";});
                
                link = svg.selectAll(".link")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("class", "link")
                    .attr('marker-end',function(d){ return "url(#arrow" + d.color +')'})
                    .style("stroke", function (l) {return l.color})
                    .attr("x1", function (d) { return d.x1 - 2 })
                    .attr("y1", function (d) { return d.y1 - 2})
                    .attr("x2", function (d) { return d.x2 - 2})
                    .attr("y2", function (d) { return d.y2 - 2});
                    
                }
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
                    url: "/Editor/getStory?title="+this.currentStory+"&group=private",
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


        $('#activitiesForm, #editStoryForm, #insertFacility, #insertDifficulty').keydown(function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        });

        $(document).on('click','#buttonGraph', () =>{
            this.show();
        });
    },
    created() {
        /* retrieve widgets' names */
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/Editor/getWidgets",
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