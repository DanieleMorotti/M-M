var widgetComp = null;

export default {
    name:'act',
    
    data() {
        return{
            story: null,
            missions: [],
            facilities: [],
            nextAct: null,
            nextMiss: null,
            widget: null,
            door: null
        }
    },
    methods: {
        visualize(type, mission, activity) {
            if(type == "scelta multipla") {
                $("#text").html(this.missions[mission].activities[activity].question);
                $("#text").append(`<div id="answers"></div>`)
                let i = 1;
                this.missions[mission].activities[activity].answers.forEach(element => {
                    $("#answers").append(`<br><input type="radio" id="answer${i}" name="answer" value="${element}" checked>
                    <label for="answer${i}">${element}</label>`);
                    i++;
                });
            }
            else if( type =="domanda aperta") {
                $("#text").html(this.missions[mission].activities[activity].question);
                $("#text").append(`<br><input type="text" id="answer"/>`);
            }
            else {  //tipe figurative
                $('#text').html("");
                $('#text').append(this.missions[mission].activities[activity].instructions);
                let widget = this.missions[mission].activities[activity].widget;
                $('#schermo').css('background-image', `url("/Server-side/widgets/${widget}/${widget}.jpg")`);
         
                $('#schermo').append(`<script  type="module" src='/Player/widgets/door.js'></script>`);

                let question = this.missions[mission].activities[activity].question;
                let correctAns = this.missions[mission].activities[activity].correctAns;

                async function load() {
                    console.log('here')
                    widgetComp = await import(`/Player/widgets/${widget}.js`);
                    $('#schermo').append(`<div id="widget"></div>`)
                    $('#widget').append(widgetComp.default.template);
                    widgetComp.default.methods.render(question, correctAns)
                }
                
                load();
            }   
           
            
         
        },
        verify(type, mission, activity) {
            $("#info").html("");
            if((type == 'scelta multipla' && $('input[name="answer"]:checked').val() == this.missions[mission].activities[activity].correctAns) ||
            (type == "domanda aperta"  && ($("#answer").val() == this.missions[mission].activities[activity].correctAns))) {
                    $("#text").html(this.story.facilities[activity]);
                    this.nextAct = this.missions[mission].activities[activity].goTo.ifCorrect.nextActivity;
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifCorrect.nextMission;
                    return([this.nextAct, this.nextMiss]);
            }
            else if(type == 'scelta multipla') { 
                $("#text").html(this.story.difficulties[activity]);
                this.nextAct = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextActivity; 
                this.nextMiss = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextMission;
                return([this.nextAct, this.nextMiss]);
            }
            else if(type == "domanda aperta") {
                if($("#answer").val() == "") {
                    $("#info").html("Inserisci una risposta!");
                    return(false)
                }
                else {
                    $("#text").html(this.story.difficulties[activity]);
                    this.nextAct = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextActivity; 
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextMission;
                    return([this.nextAct, this.nextMiss]);
                }   
            }
            else if (type == "figurativa") {
                $('#widget').remove();
                $('#schermo').css('background-image', 'none');

                if(widgetComp.default.methods.check()) {
                    $("#text").html(this.story.facilities[activity]);
                    this.nextAct = this.missions[mission].activities[activity].goTo.ifCorrect.nextActivity;
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifCorrect.nextMission;
                    return([this.nextAct, this.nextMiss]);
                }
                else {
                    $("#text").html(this.story.difficulties[activity]);
                    this.nextAct = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextActivity; 
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextMission;
                    return([this.nextAct, this.nextMiss]);
                }
            }
            else {
                return(false)
            }
        
            
        }, 
        initialize() {
            let storyItem = JSON.parse(localStorage.getItem("story"));
            this.story = storyItem;
            this.missions = storyItem.missions;
            this.nextMiss = 0;
            this.nextAct = 0;

            //to update the server about my current position
         /*   setInterval(() => {                
                $.ajax({
                    type: "POST",
                    url: '/updatePlayerPosition',
                    data: {
                        currMission: parseInt(this.nextMiss)+1,
                        currAct: parseInt(this.nextAct)+1
                    },
                    success: (data) =>{
                        console.log("Ok");
                    },
                    error: function (e) {
                        console.log("error in update player position",e);
                    }
                })
            }, 3000); */
        }
    }
}

