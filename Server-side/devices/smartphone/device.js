//import render from './activities.js'

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
		<div> new</div>
		<div id="schermo">
			<div id="text"> </div>
			<p id="next" @click="next"> &rarr; </p>
		</div>
        <div id="bottone"></div>
	</div>
`,
	methods: {
		
		play() {
		

		},

		next() {
			this.type = this.missions[this.currentMission].activities[this.currentActivity].type;
			console.log(this.type);
		},
		check() {
		}
	},
	activated() {
		storyItem = JSON.parse(localStorage.getItem("story"));
		this.missions = storyItem.missions;
		$('#text').text(storyItem.introduction);
	}
}