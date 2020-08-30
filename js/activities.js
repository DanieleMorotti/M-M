var story;
var activities;
var current;
var usedFacilities = [];
var usedDifficulties = [];


function renderActivity1() {
    current = localStorage.getItem("current");
    var l1 = activities[current].correctAns.length;
    var l2 = activities[current].incorrectAns.length;
    var string = activities[current].instructions;

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

}

function renderActivity2() {
    current = localStorage.getItem("current");
    var string = activities[current].instructions;

    string += `<br><br><input type="text" placeholder="`+ activities[current].definition +`"><br>`;
    $('#text').html(string);
}

function renderActivity3() {
    current = localStorage.getItem("current");
    window.location.href = activities[current].html;
    $('#text').html(activities[current].result);
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

export default {
    render1: renderActivity1,
    render2: renderActivity2,
    render3: renderActivity3,
    displayDifficulties: displayDifficulties,
    displayFacilities: displayFacilities,
    
    initialized() {
        story = JSON.parse(localStorage.getItem("story"));
        activities = story[0].activities;
    }
    
};