import render from '/Player/js/activities.js'
import { bus } from '/Player/js/index.js';

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
			instruction: true,
			question: false,
			verify: false,
			obj: null,
			over: false,
			myName: null,
			whenStarted: null
        }
	},
	template: `
	<div>
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

	
	<div id="widgetNav" class="overlay">
		<a href="javascript:void(0)" class="closebtn" @click="closeNav">&times;</a>
		<div id="widget" class="overlay-content"></div>
	</div>
	</div>
`,
	methods: {
		openNav() {
			document.getElementById("widgetNav").style.height = "100%";
		},
		closeNav() {
			document.getElementById("widgetNav").style.height = "0%";
		},
		next() {
			if(this.over) {
				bus.$emit('over','true'); 
				$('#toHome').click();
			}
			else {
				if(this.instruction) {
					if(this.obj) {
						if(this.obj[0] != 'x') {
							this.currentActivity = this.obj[0]; this.currentMission = this.obj[1];
						}
						else {
							$('#text').html("");
							$('#text').append(storyItem.conclusion);
							$('#text').append(`<br><br><p>Congratulazioni hai totalizzato ${this.obj[2]} punti!`)
							this.over = true;
						}
						this.obj = null;
					}
					if(!this.over) {
						$('#text').html("");
						$('#text').append(this.missions[this.currentMission].activities[this.currentActivity].setting);
						$('#text').append('<br>'+this.missions[this.currentMission].activities[this.currentActivity].instructions);				
						this.question = true;
						this.instruction = false;
					}
				}
				else if(this.question) {
					this.type = this.missions[this.currentMission].activities[this.currentActivity].type;
					render.methods.visualize(this.type, this.currentMission, this.currentActivity);
					this.verify = true;
					this.question = false;
				}
				else if(this.verify) {
					this.obj = render.methods.verify(this.type,this.currentMission, this.currentActivity);
					this.instruction = true;
					this.verify = false;
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
				$('#text').html(`<p>Ciao ${this.myName}, <br>${storyItem.introduction}<p>`);

			},
			error: function (e) {
				console.log("error in get player name",e);
			}
		})
	},
	created(){
		//saving the moment when i started
		this.whenStarted = new Date();
	}
}