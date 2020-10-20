/*

var story;
var activities;
var current;
var usedFacilities = [];
var usedDifficulties = [];


function renderActivity(type) {

    current = localStorage.getItem("current");
    var l1,l2;
    var string = activities[current].instructions;
    if(type == "scelta multipla"){
        l1 = activities[current].correctAns.length;
        l2 = activities[current].incorrectAns.length;
        string += `<br><br><label for="answers">Scegli una risposta:</label><ul>`;
        for(i = 0; i < l1; i++) {
            string += `<li class="correctAns">`+activities[current].correctAns[i]+`</li>`;
        }
        for(i = 0; i < l2; i++) {
            string += `<li class="incorrectAns">`+activities[current].incorrectAns[i]+`</li>`;
        }
        string += `</ul><br>`;
    
        $('#text').html(string);
    
        var listItems = document.querySelectorAll("ul li");
        var i = 0;
    
        listItems[i].classList.add("highlight");
    
        window.addEventListener("keydown", function(e) {
            // space and arrow keys
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
    
        document.addEventListener("keydown", function(event){
            switch(event.keyCode){
                case 38: // Up arrow    
                    listItems[i].classList.remove("highlight");
                    
                    current = i > 0 ? --i : 0;          
                    listItems[i].classList.add("highlight"); // Highlight the new element
                    break;
                case 40: // Down arrow
                    listItems[i].classList.remove("highlight");
                    
                    i = i < listItems.length-1 ? ++i : listItems.length-1;  
                    listItems[i].classList.add("highlight");       // Highlight the new element
                    break;    
            }
        });
        $('#check').attr('disabled', false);

    }else if(type == "domanda aperta"){
        l1 = activities[current].correctAns.length;
        string += `<br><br><input type="text" placeholder="`+ activities[current].definition +`"><br>`;
        $('#text').html(string);
        $('#check').attr('disabled', false);
        
    }else{
        window.location.href = activities[current].html;
        $('#text').html(activities[current].result);
        $('#play').attr('disabled', false);
    }
}

function displayDifficulties() {
    var i = 0;
    while(usedDifficulties.includes(i)) {
        i = Math.floor(Math.random() * 10) % story[0].difficulties.length;
    }   
    text.innerHTML = story[0].difficulties[i];
    usedDifficulties.push(i);
}

function displayFacilities() {
    var i = 0;
    while(usedFacilities.includes(i)) {
        i = Math.floor(Math.random() * 10) % story[0].facilities.length;
    }   
    text.innerHTML = story[0].facilities[i];
    usedFacilities.push(i);
}

function initialized() {
    story = JSON.parse(localStorage.getItem("story"));
    activities = story[0].activities;
}
*/

export default {
    name:'act',
    data() {
        return{
            story: null,
            missions: [],
            facilities: [],
        }
    },
    methods: {
        visualize(type, mission, activity) {
            if(type == "scelta multipla") {
                $("#text").html(this.missions[mission].activities[activity].question);
                let i = 1;
                this.missions[mission].activities[activity].answers.forEach(element => {
                    $("#text").append(`<br><input type="radio" id="answer${i}" name="answer" value="${element}" checked>
                    <label for="answer${i}">${element}</label>`);
                    i++;
                });
            }
            else if( type =="domanda aperta") {
                $("#text").html(this.missions[mission].activities[activity].question);
                $("#text").append(`<br><input type="text" id="answer"/>`);
            }
            
        },
        verify(type, mission, activity) {
            let nextAct, nextMiss;
            if((type == 'scelta multipla' && $('input[name="answer"]:checked').val() == this.missions[mission].activities[activity].correctAns) ||
            (type == "domanda aperta"  && ($("#answer").val() == this.missions[mission].activities[activity].correctAns))) {
                    $("#text").html(this.story.facilities[activity]);
                    nextAct = this.missions[mission].activities[activity].goTo.ifCorrect.nextActivity;
                    nextMiss = this.missions[mission].activities[activity].goTo.ifCorrect.nextMission;
                }
                else { 
                    $("#text").html(this.story.difficulties[activity]);
                    nextAct = this.missions[mission].activities[activity].goTo.ifNotCorrect.nextActivity; 
                    nextMiss = this.missions[mission].activities[activity].goTo.ifCorrect.nextMission;
                }
        
            return([nextAct, nextMiss]);
        }, 
        initialize() {
            let storyItem = JSON.parse(localStorage.getItem("story"));
            this.story = storyItem;
            this.missions = storyItem.missions;
        }
    },
    
}
