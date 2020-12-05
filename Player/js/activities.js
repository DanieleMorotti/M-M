//import { runInThisContext } from "vm";

var widgetComp = null;

export default {
    name:'activities',
    
    data() {
        return{
            story: null,
            missions: [],
            usedFacilities: 0,
            usedDifficulties: 0,
            currentF: null,
            currentD: null,
            nextAct: null,
            nextMiss: null,
            widget: null,
            score: 0,
            mission: 0,
            activity: 0,
            servSent: null,
            data: null,
            groupNum: 0
        }
    },
    methods: {
        send(event, mission, activity) {
            event.preventDefault();
            let data = new FormData();
            data.append('question',this.missions[mission].activities[activity].question);

            if($('#answer').attr("type") == 'file')
                data.append('input',document.getElementById('answer').files[0]);
            else 
                data.append('input',$("#answer").val());

            $('#text').html("");
            $('#text').append(this.missions[mission].activities[activity].waitMsg);

            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: '/Play/toEvaluate',
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                success: (data) =>{
                    let interval = setInterval(()=>{
                        if(this.data) {
                            console.log(this.data);
                            $('#next').attr("disabled",false);
                            clearInterval(interval);
                        }
                    },5000);
                    
                },
                error: function (e) {
                    console.log("error");
                }
            });
        },
        /* function for activities' visualization */
        visualize(type, mission, activity) {
            if(type == "scelta multipla") {
                $("#text").html(this.missions[mission].activities[activity].question);
                $("#text").append(`<div id="answers"></div>`)
                let i = 1;
                this.missions[mission].activities[activity].answers.forEach(element => {
                    $("#answers").append(`
                    <br>
                    <label for="answer${i}" class="container">
                     ${element}
                    <input type="radio" id="answer${i}" name="answer" value="${element}">
                    <span class="checkmark"></span></label>`);
                    i++;
                });
            }
            else if( type =="domanda aperta") {
                $("#text").html(this.missions[mission].activities[activity].question);
                $("#text").append(`<br><input  type="text" id="answer" placeholder="Scrivi qui" />`);
            }
            else if(type == "valutabile") {
                this.data = null;
                $("#text").html(this.missions[mission].activities[activity].question);         
                $("#text").append(`<br><form id="evaluableForm">
                    <label for="answer" style="display:none">Invia risposta:</label>
                    <input type="${this.missions[mission].activities[activity].inputType}" id="answer"  placeholder="Scrivi qui"/><br>
                    <button id="sendBtn">Invia</button>
                    </form>`); 
                $('#evaluableForm').show();
                    $('#next').attr("disabled","true");
                
                this.mission = mission;
                this.activity = activity;
            }
            else {  //type figurative 
                $('#text').html("");
             //   $('#text').append(this.missions[mission].activities[activity].instructions);
                $('#text').append(`<br><button id="widgetBtn">Widget</button>`);
                let widget = this.missions[mission].activities[activity].widget;
                
                $.ajax({
                    url: `/Server-side/widgets/${widget}/${widget}.jpg`,
                    type: 'GET',
                    success: function(data){ 
                        $('#widgetNav').css('background-image', `url("/Server-side/widgets/${widget}/${widget}.jpg")`);     
                    },
                    error: function(){
                        $('#widgetNav').css('background-image', 'none');     
                    }
                })
         
                let question = this.missions[mission].activities[activity].question;
                let correctAns = this.missions[mission].activities[activity].correctAns;

                async function load() {
                    widgetComp = await import(`/Server-side/widgets/${widget}/${widget}.js`);
                    $('#widget').append(widgetComp.default.template);
                    widgetComp.default.methods.render(question, correctAns);
                    document.getElementById("widgetNav").style.height = "100%";
                }
                
                load();

            }  
        },
        verify(type, mission, activity) {            
            /* if response is correct */
            if((type == "scelta multipla" && $('input[name="answer"]:checked').val() == this.missions[mission].activities[activity].correctAns) ||
            (type == "domanda aperta"  && ($("#answer").val() == this.missions[mission].activities[activity].correctAns)) ||
            (type == "valutabile" && this.data[0].mark > 5) ||
            (type == "figurativa" && widgetComp.default.methods.check())) {

                    // compute next facility
                    if(this.currentF < this.story.facilities.length) {
                        $("#text").html(this.story.facilities[this.currentF]);
                        this.currentF++;
                    }
                    else $("#text").html("Tutto tranquillo");

                    /* select next activity */
                    this.nextAct = this.missions[mission].activities[activity].goTo.ifCorrect.nextActivity[this.groupNum];
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifCorrect.nextMission[this.groupNum];

                   
                    if(type == 'valutabile') 
                        this.score = parseInt(this.score) + parseInt(this.missions[mission].activities[activity].score*(this.data[0].mark/10));
                    else 
                        this.score = parseInt(this.score) + parseInt(this.missions[mission].activities[activity].score);
 
                    if (type == "figurativa") 
                        $('#widget').html("");
                        
                    return([this.nextAct, this.nextMiss, this.score]);
            }
            /* if user didn't answered */
            else if(type == "domanda aperta" && $("#answer").val() == "") {
               $('#text').append('<p style="margin-top:1rem">Inserisci una risposta!</p>')
                    return(false)
            }
            /* if answer is incorrect */
            else {
                // compute next difficulty
                if(this.currentD < this.story.difficulties.length) {
                    $("#text").html(this.story.difficulties[this.currentD]);
                    this.currentD++;
                }
                else $("#text").html("Fai attenzione!");

                this.nextAct = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextActivity[this.groupNum]; 
                this.nextMiss = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextMission[this.groupNum];

                
                if (type == "figurativa") 
                    $('#widget').html("");
        
                console.log(this.score)
                return([this.nextAct, this.nextMiss, this.score]);
            }
            
        }, 
        initialize() {
            let storyItem = JSON.parse(localStorage.getItem("story"));
            this.groupNum = 0;
            this.story = storyItem;
            this.missions = storyItem.missions;
            this.nextMiss = storyItem.firstActivity.mission;
            this.nextAct = storyItem.firstActivity.activity;
            this.score = 0;

            this.currentF = 0 ;
            this.currentD = 0 ;

            $(document).on('keydown','#answer', (e) =>{
                if (e.keyCode == 13) {
                    document.getElementById('next').click();
                    return false;
                }
            });

            $(document).on('click','#widgetBtn', (e) =>{
                    document.getElementById("widgetNav").style.height = "100%";
            });
            //to update the server about my current position
            setInterval(() => {                
                $.ajax({
                    type: "POST",
                    url: '/Play/updatePlayerPosition',
                    data: {
                        currMission: parseInt(this.nextMiss),
                        currAct: parseInt(this.nextAct)
                    },
                    success: (data) =>{
                        console.log("Update posizione avvenuto");
                    },
                    error: function (e) {
                        console.log("error in update player position",e);
                    }
                })
            }, 5000); 

            

            $(document).on('click','#sendBtn', (event) =>{
                this.send(event, this.mission, this.activity);
            });

            this.servSent = new EventSource('/Play/checkMark');

            this.servSent.onmessage = (event) =>{
                this.data = JSON.parse(event.data);
            }
        }
    }
    

}

