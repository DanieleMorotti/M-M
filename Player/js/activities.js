//import { runInThisContext } from "vm";

var widgetComp = null;

export default {
    name:'activities',
    
    data() {
        return{
            story: null,
            missions: [],
            usedFacilities: [],
            usedDifficulties: [],
            currentF: null,
            currentD: null,
            nextAct: null,
            nextMiss: null,
            widget: null,
            score: 0
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

                $.ajax({
                    url: `/Server-side/widgets/${widget}/${widget}.jpg`,
                    type: 'GET',
                    success: function(data){ 
                        $('#schermo').css('background-image', `url("/Server-side/widgets/${widget}/${widget}.jpg")`);     
                    },
                    error: function(data) {
                        $('#schermo').css('background-color', 'black');
                    }
                })
                
         
                let question = this.missions[mission].activities[activity].question;
                let correctAns = this.missions[mission].activities[activity].correctAns;

                async function load() {
                    console.log('here')
                    widgetComp = await import(`/Server-side/widgets/${widget}/${widget}.js`);
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

                    // compute next facility
                    while(this.usedFacilities.includes(this.currentF)) {
                        if(this.currentF < this.story.facilities.length - 1) this.currentF++;
                        else this.currentF--;
                    }
                    $("#text").html(this.story.facilities[this.currentF]);
                    this.usedFacilities.push(this.currentF);

                    this.nextAct = this.missions[mission].activities[activity].goTo.ifCorrect.nextActivity;
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifCorrect.nextMission;
                    this.score = this.score + this.missions[mission].activities[activity].score;
                    return([this.nextAct, this.nextMiss, this.score]);
            }
            else if(type == 'scelta multipla') { 

                // compute next difficulty
                while(this.usedFacilities.includes(this.currentD)) {
                    if(this.currentD < this.story.difficulties.length - 1) this.currentD++;
                    else this.currentD--;
                }
                $("#text").html(this.story.difficulties[this.currentD]);
                this.usedDifficulties.push(this.currentD);

                this.nextAct = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextActivity; 
                this.nextMiss = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextMission;
                return([this.nextAct, this.nextMiss, this.score]);
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
                    return([this.nextAct, this.nextMiss, this.score]);
                }   
            }
            else if (type == "figurativa") {
                $('#widget').remove();
                $('#schermo').css('background-image', 'none');

                if(widgetComp.default.methods.check()) {
                    $("#text").html(this.story.facilities[activity]);
                    this.nextAct = this.missions[mission].activities[activity].goTo.ifCorrect.nextActivity;
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifCorrect.nextMission;
                    this.score = this.score + this.missions[mission].activities[activity].score;
                    return([this.nextAct, this.nextMiss, this.score]);
                }
                else {
                    $("#text").html(this.story.difficulties[activity]);
                    this.nextAct = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextActivity; 
                    this.nextMiss = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextMission;
                    return([this.nextAct, this.nextMiss, this.score]);
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
            this.score = 0;
            this.usedFacilities = []
            this.usedDifficulties = []
            this.currentF = Math.floor(Math.random() * this.story.facilities.length); 
            this.currentD = Math.floor(Math.random() * this.story.difficulties.length)

            //to update the server about my current position
            setInterval(() => {                
                $.ajax({
                    type: "POST",
                    url: '/Play/updatePlayerPosition',
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
            }, 3000); 
        }
    }
}

