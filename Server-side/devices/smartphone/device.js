import render from '/Player/js/activities.js'

var storyItem;

export default {
	name:'device',
	data() {
        return{
			storyItem: null,
			missions: [],
			performedMissions: [],
			currentMission: 0,
			currentActivity: 0,
			verify: false,
			obj: null
        }
    },
    template: `
	<div class="device">
        <div id="dettaglio">
            <div id="sensore"></div>
            <div id="microfono"></div>
        </div>
        <div id="accesione-button"></div>
        <div id="volume-su"></div>
		<div id="volume-giu"></div>
		<div id="schermo">
			<div id="text"> </div>
			<div id="info"> </div>
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
				this.verify = true;
			}
			else {
				if(this.obj) {
					console.log(this.obj) 
					if(this.obj[0] != 'x') {
						this.currentActivity = this.obj[0]; this.currentMission = this.obj[1];
						this.type = this.missions[this.currentMission].activities[this.currentActivity].type;
						render.methods.visualize(this.type, this.currentMission, this.currentActivity);
					}
					else {
						$('#text').html("");
						$('#text').append(storyItem.conclusion);
					}
					this.obj = null;
				}
				else {
					this.obj = render.methods.verify(this.type,this.currentMission, this.currentActivity);
				}
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