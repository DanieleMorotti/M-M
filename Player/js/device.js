import render from './activities.js'

var storyItem;
var activities;
var performedActivities = [];
var currentAct;
var type;

export default {
	name:'device',
    template: `
	<div id="object" class="col-md-6 align-items-center container">
	<div class="form-group pt-4 d-flex align-items-center container col-md-10" >
		<label hidden for="yourTextArea">Text Area</label>
		<div  class="form-control" id="text"></div>
	</div>
	<div class="row">
		<div class="btn-group mb-1 d-flex align-items-center container col-md-10" role="group">
			<button type="button" class="btn btn-dark mr-1	w-100" id="back" v-on:click="back" disabled>Back</button>
			<button type="button" class="btn btn-dark mr-1	w-100" id="play" v-on:click="play">&#9658;</button>
			<button type="button" class="btn btn-dark mr-1	w-100" id="next" v-on:click="next" disabled>Next</button>
		</div>
	</div>
	<div class="row">
		<div class="btn-group mb-1 d-flex align-items-center container col-md-10" role="group">
			<button type="button" class="btn btn-dark mr-1	w-100" id="room">Room</button>
			<button type="button" class="btn btn-dark mr-1	w-100">*</button>
			<button type="button" class="btn btn-dark mr-1	w-100" id="check" v-on:click="check">&#8612;</button>
		</div>
	</div>
</div>`,
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