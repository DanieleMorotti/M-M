import { bus } from './index.js';

export default {
    name: 'editMenu',
    data() {
        return{
            activities: [],
            currentActivity: 0,
            currentStory: '',
            storyWhereIcopy:'',
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
                        <h2>Attività</h2>
                        <p v-if="this.activities.length==0"> Nessuna attività per questa storia </p>
                        <ul v-else id="activitiesSaved">
                            <li v-for="(activity,index) in activities" :key="index">
                                Attività {{activity.number + 1}} 
                                <span id="icon-group">
                                    <i class="fas fa-edit" @click="editActivity(index)"></i>&nbsp;&nbsp;
                                    <i class="fas fa-cut" @click="currentActivity = index" data-toggle="modal" data-target="#moveModal"></i>&nbsp;&nbsp;
                                    <i class="fas fa-clone"  @click="currentActivity = index" data-toggle="modal" data-target="#copyModal"></i>&nbsp;&nbsp;
                                    <i  class="fas fa-trash-alt" @click="deleteActivity(index)"></i>
                                </span>
                            </li>
                        </ul>
                    </li>
                </ul>
            </form>
            <button @click="checkForm">FINITO</button>

        <!-- Modals for copy or move an activity -->
            <div class="modal fade" id="moveModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Spostamento attività</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span>Scegli in quale storia spostare l'attività </span>
                            <button v-for="(title,index) in titles.privateList" :key="index" type="button" @click="storyWhereIcopy=title" class="list-group-item list-group-item-action">
                                {{title}} 
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" @click="moveActivity(currentActivity)">SPOSTA</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="copyModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Copia di un'attività</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span>Scegli in quale storia copiare l'attività </span>
                            <button v-for="(title,index) in titles.privateList" :key="index" type="button" @click="storyWhereIcopy=title" class="list-group-item list-group-item-action">
                                {{title}} 
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" @click="copyActivity(currentActivity,'copy')">COPIA</button>
                        </div>
                    </div>
                </div>
            </div>

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
        <!--  -->

            <form id="activitiesForm" @submit="addActivity">
                <h2>Nuova attività</h2>
                <ul id="activitiesList">
                    <li>
                        <h5>Scegli il tipo dell'attività : </h5>
                        <input id="multipleChoice" type="radio" name="activityTypeGroup" value="scelta multipla" checked/>
                        <label for="multipleChoice">Scelta multipla</label>
                        <input id="openQuest" type="radio" name="activityTypeGroup" value="domanda aperta" />
                        <label for="openQuest">Domanda aperta</label>
                        <input id="figur" type="radio" name="activityTypeGroup" value="figurativa" />
                        <label for="figur">Figurativa</label>

                        <h5>Dove si svolge l'attività?(ambientazione)</h5>
                        <input type="text" name="where" />

                        <h5>Spiegazione per lo svolgimento dell'attività:</h5>
                        <textarea name="instructions" rows="3" cols="40"></textarea>

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
        </div> 
    `,
    methods: {
        addActivity(e) {   
            e.preventDefault();
            if($('#saveActivity').val() == "Salva modifiche"){
                let widgetValue = "";
                if(this.currentWidget >= 0) widgetValue = this.widgets[this.currentWidget];
                this.activities[this.currentActivity].type =  $("#activitiesList li input:checked").val();
                this.activities[this.currentActivity].setting = $("#activitiesList li input[name='where']").val();
                this.activities[this.currentActivity].instructions = $("#activitiesList li textarea[name='instructions']").val();
                this.activities[this.currentActivity].widget = widgetValue;

                $('#activitiesForm h2').text(`Nuova attività`)
                $('#saveActivity').prop("value", "Salva attività");
                this.currentActivity = this.activities[this.activities.length - 1].number +1;
            }
            else {
                let widgetValue = "";
                if(this.currentWidget >= 0) widgetValue = this.widgets[this.currentWidget];
                let activity = {
                    number: this.currentActivity,
                    type: $("#activitiesList li input:checked").val(),
                    setting:  $("#activitiesList li input[name='where']").val(),
                    instructions: $("#activitiesList li textarea[name='instructions']").val(),
                    widget: widgetValue
                }
                this.activities.push(activity);
                this.currentActivity++;
                this.currentWidget = -1;
            }     

            $('#activitiesForm')[0].reset();
            $("#buttonWidget").prop("value","Scegli");
            $("#infoWidget").text("");
            $("#infoWidget").css("display", "none");
        },
        editActivity(index){
                $("#activitiesList li input[value='"+this.activities[index].type+"']").prop('checked', true);
                $("#activitiesList li input[name='where']").val(this.activities[index].setting);
                $("#activitiesList li textarea[name='instructions']").val(this.activities[index].instructions);
                
                $('#activitiesForm h2').text("Modifica l'attività "+ (this.activities[index].number + 1))
                $('#saveActivity').prop("value", "Salva modifiche");

                if(this.activities[index].widget) {
                    $("#buttonWidget").prop("value","Cambia");
                    $("#infoWidget").text("Hai scelto il widget: " + this.activities[index].widget);
                    $("#infoWidget").css("display", "inline");
                    this.currentWidget = this.widgets.indexOf(this.activities[index].widget);
                }
                
                this.currentActivity = index;
        },
        moveActivity(index){
            this.copyActivity(index);

            this.activities.splice(index,1);
            this.currentActivity = (this.activities.length != 0)?this.activities[this.activities.length - 1].number +1: 0;
        },
        copyActivity(index, value){
            var obj = Object.assign({}, this.activities[index]);
            //copying all the data of the activity
            let toStory = this.storyWhereIcopy;
            if(value) {
                obj.number = this.activities.length;
                this.activities.push(obj);
                this.currentActivity = this.activities.length + 1;
                toStory="";
            }
            $.ajax({
                type: "POST",
                url: "/copyActivity?toStory="+toStory,
                data: obj,
                cache: false,
                success: (data) =>{
                    $('#moveModal').modal('hide');
                    $('#copyModal').modal('hide');
                },
                error: function (e) {
                    console.log("error",e);
                }
            });
        },
        deleteActivity(index) {
             this.activities.splice(index,1);
             $('#activitiesForm')[0].reset();
             $('#activitiesForm h2').text(`Nuova attività`)
             $('#saveActivity').prop("value", "Salva attività");
             $("#buttonWidget").prop("value","Scegli");
             $("#infoWidget").text("");
             $("#infoWidget").css("display", "none");
             this.currentActivity = (this.activities.length != 0)?this.activities[this.activities.length - 1].number +1: 0;
        },
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
        checkName(type) {
            let list, value, input, info;
            if(type == 'widget') {
                list = this.widgets;
                input = $("#inpWidgetName");
                value = $("#inpWidgetName").val();
                info =  $("#widgetInfo");
            } 
            else if(type == 'title') {
                list = this.titles.privateList.concat(this.titles.publicList);
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

            data.append('activities',JSON.stringify(this.activities));     
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
                    var story = JSON.stringify({title: $('#inpTitle').val(), original: originTitle, changed: titleChanged});
                    this.$root.$emit('updateStories',story);
                    $('#editStoryForm')[0].reset();
                    $('#activitiesForm')[0].reset();
                    $('.infoForFile').text("");
                    $('#toHome').click();
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
                else if(item[0] == "activities") {
                    this.activities = [];
                    this.currentActivity = 0;
                    for(var i = 0; i < item[1].length; i++) {
                        this.activities.push(item[1][i]);
                    }
                    this.currentActivity = (item[1].length != 0) ? item[1][item[1].length - 1].number +1: 0;
                    console.log(this.currentActivity);
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
        this.activities = [];
        this.currentActivity = 0;
        this.currentStory = '';
        bus.$emit('ready','pronto'); 
        bus.$once('story',(story) =>{
            this.currentStory = story;
            if(this.currentStory) {
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