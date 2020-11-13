import render from '/Player/js/activities.js'

let storyItem;

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
			obj: null,
			myName: null
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
		<div id="container">
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
					if(this.obj[0] != 'x') {
						this.currentActivity = this.obj[0]; this.currentMission = this.obj[1];
						this.type = this.missions[this.currentMission].activities[this.currentActivity].type;
						render.methods.visualize(this.type, this.currentMission, this.currentActivity);
					}
					else {
						$('#text').html("");
						$('#text').append(storyItem.conclusion);
						$('#text').append(`<br><br><p>Congratulazioni hai totalizzato ${this.obj[2]} punti!`)
						$('#next').attr("disabled","disabled");
					}
					this.obj = null;
				}
				else {
					this.obj = render.methods.verify(this.type,this.currentMission, this.currentActivity);
				}
			}
		}
	},
	activated() {
		this.myName = document.cookie.split('=')[1];
		storyItem = JSON.parse(localStorage.getItem("story"));
		this.missions = storyItem.missions;
		render.methods.initialize();

		//request for getting new name if exist
		$.ajax({
			type: "GET",
			url: '/Play/getNewName',
			success: (data) =>{
				if(data)this.myName = data;
				$('#text').text('ciao '+this.myName+'\n'+storyItem.introduction);

			},
			error: function (e) {
				console.log("error in get player name",e);
			}
		})
	}
}