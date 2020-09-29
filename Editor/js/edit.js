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
            invalid: false
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
                        <h5>Scegli il dispositivo che il cellulare rappresenterà:</h5>
                        <input type="button" id="buttonDevice" data-toggle="modal" data-target="#deviceModal" value="Scegli"/>
                        <p id="infoDevice" style="display:none"> </p>
                    </li>
                    <li>
                        <label for="inpIntr">Inserisci l'introduzione della tua storia:</label><br>
                        <textarea id="inpIntr" name="introduction" rows="3" cols="40"></textarea>
                    </li>
                    <li>    
                        <h2 style="display:inline-block">Missioni</h2>&nbsp;&nbsp;<i class="fas fa-plus" @click="addMission"></i>
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
                </ul>
            </form>
            <button @click="checkForm">FINITO</button>

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
                            <input id="answer" type="text" name="answer" :disabled="type =='figurativa'"  @keyup.enter="addAnswer(event)"  />
                            <i class="fas fa-plus-square" id="insertAnswer" @click="addAnswer(event)"></i>
                            <ul id="answers">
                                <li v-for="(answer,index) in answerList" :key="index">
                                {{answer}} &nbsp;&nbsp;<i  class="fas fa-trash-alt" @click="answerList.splice(index,1)"></i>
                                </li>
                            </ul>
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
                this.missions[this.currentMission].activities[this.currentActivity].answers = this.answerList;

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
                let activity = {
                    number: activityNumber,
                    type: $("#activitiesList li input:checked").val(),
                    setting:  $("#activitiesList li input[name='where']").val(),
                    instructions: $("#activitiesList li textarea[name='instructions']").val(),
                    question: $("#question").val(),
                    answers: this.answerList,
                    isActive: true,
                    widget: widgetValue
                }
                this.missions[missionIndex].activities.push(activity);
                this.currentWidget = -1;
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
                //prevent the user to change the activity mission from this form
                $('#chooseMission').hide();
                $('label[for="chooseMission"]').hide();

                $("#activitiesList li input[value='"+this.missions[misInd].activities[index].type+"']").prop('checked', true);
                $("#activitiesList li input[name='where']").val(this.missions[misInd].activities[index].setting);
                $("#activitiesList li textarea[name='instructions']").val(this.missions[misInd].activities[index].instructions);
                
                $('#activitiesForm h2').text("Modifica l'attività "+ (parseInt(this.missions[misInd].activities[index].number) + 1))
                $('#saveActivity').prop("value", "Salva modifiche");

                $("#question").prop("value",this.missions[misInd].activities[index].question);
                
                this.type = this.missions[misInd].activities[index].type;
                if(this.type !== 'figurativa') this.answerList = this.missions[misInd].activities[index].answers;

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

            let data = new FormData($('#editStoryForm')[0]);

            var originTitle = this.currentStory;
            var verifyInput = $('input[type=file]');
            var titleChanged = ($("#inpTitle").val() != originTitle && (originTitle != '')) ? true : false;

            data.append('missions',JSON.stringify(this.missions,null,2));  
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
                else {
                    $("*[name ='"+item[0]+"'").val(item[1]);
                }
            })
        }
    },
    activated() {
        $('#editStoryForm')[0].reset();
        $('#activitiesForm')[0].reset();
        this.missions = [{name:"Missione 1",activities:[],isActive:false}];
        this.currentActivity = 0;
        this.currentStory = '';
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