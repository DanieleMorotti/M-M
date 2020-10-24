import render from '/Player/js/activities.js'

var storyItem;
var activities;
var performedActivities = [];
var currentAct;
var type;

export default {
	name:'device',
	data() {
        return{
			storyItem: null,
			missions: [],
			performedMissions: [],
			currentMission: 0,
			currentActivity: 0,
			verify: false
        }
    },
    template: `
	<div class="smart">
        <div id="dettaglio">
            <div id="sensore"></div>
            <div id="microfono"></div>
        </div>
        <div id="accesione-button"></div>
        <div id="volume-su"></div>
		<div id="volume-giu"></div>
		<div id="schermo">
			<div id="text"> </div>
			<button id="next" @click="next"> &rarr; </button>
		</div>
        <div id="bottone"></div>
	</div>
`,
	methods: {

		next() {
			if(!this.verify) {
				this.type = this.missions[this.currentMission].activities[this.currentActivity].type;
				render.methods.visualize(this.type, this.currentMission, this.currentActivity);
			//	this.currentActivity++;
				this.verify = true;
			}
			else {
				let obj = render.methods.verify(this.type,this.currentMission, this.currentActivity);
				this.verify = false;
				this.currentActivity = obj[0]; this.currentMission = obj[1];
				console.log(obj)
			}
		},
		check() {
		}
	},
	activated() {
		storyItem = JSON.parse(localStorage.getItem("story"));
		this.missions = storyItem.missions;
		$('#text').text(storyItem.introduction);
		render.methods.initialize();
	}
}