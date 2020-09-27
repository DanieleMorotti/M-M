//import render from './activities.js'

var storyItem;
var activities;
var performedActivities = [];
var currentAct;
var type;

export default {
	name:'device',
    template: `
	<div class="smart">
        <div id="dettaglio">
            <div id="sensore"></div>
            <div id="microfono"></div>
        </div>
        <div id="acenzione-button"></div>
        <div id="volume-su"></div>
        <div id="volume-giu"></div>
        <div id="schermo">
	        <div class="frame-posizione">
		        <div id="header">
                    <div class="wrap">
                            
                    </div><!-- fine schermo -->
			    </div><!-- fine frame-posizione -->
		    </div><!-- fine header -->
        </div><!-- fine wrap-->
        <div id="bottone"></div>
    </div><!-- fine menu-responsive menu-->
`,
	methods: {
		render() {
			storyItem = JSON.parse(localStorage.getItem("story"));
			activities = storyItem[0].activities;
			render.initialized();
		},
		play() {
			if(performedActivities.length < activities.length) {
				do {
					currentAct = Math.floor(Math.random() * 10) % activities.length;
				}while(performedActivities.includes(currentAct));

				localStorage.setItem("current", currentAct);
				
				performedActivities.push(currentAct); 
				$('#text').html(activities[currentAct].where);

				$('#next').attr('disabled', false);
			}
			else {
				$('#text').html(storyItem[0].conclusion);
				$('#next').attr('disabled', true);

			}

			$('#play').attr('disabled', true);

		},
		back() {

		},
		next() {
			type = activities[currentAct].type;
			render.renderAct(type);
			$('#next').attr('disabled', true);
		},
		check() {
			if(type == "scelta multipla") {
				var risp = $('.highlight')[0];
				if(risp.classList.contains('incorrectAns')) {
					displayDifficulties();
				}
				else {
					render.displayFacilities();
				}
			}
			else if(type == "domanda aperta") {
				var risp = $("input")[0].value;
				if(risp.toLowerCase() != activities[currentAct].correctAns) {
					$("input")[0].value = "";
					return;
				}
				else
					render.displayFacilities();
			}
			else {
		
			}
			$('#play').attr('disabled', false);
			$('#check').attr('disabled', true);
		}
	}
}