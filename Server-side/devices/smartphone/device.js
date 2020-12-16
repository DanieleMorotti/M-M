import render from '/Player/js/activities.js'
import { bus } from '/Player/js/index.js';

let storyItem;

export default {
	name:'device',
	data() {
        return{
			storyItem: null,
			missions: [],
			currentMission: 0,
			currentActivity: 0,
			instruction: true,
			question: false,
			verify: false,
			obj: null,
			over: false,
			myName: null,
			whenStarted: null,
			points: 0
        }
	},
	template: `
	<div style="margin-top: 2rem;">
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
			render.methods.openNav();
		},
		closeNav() {
			render.methods.closeNav();
		},
		next() {
			if(this.over) {
				//communicate to the server that i finished the story
				$.ajax({
					type: "POST",
					url: '/Play/storyFinished',
					data: {
						whenStarted: this.whenStarted,
						points: this.points,
						assignedName: this.myName
					},
					success: (data) =>{
						console.log("Comunicato che la partita è finita correttamente");
					},
					error: function (e) {
						console.log("error in story finished",e);
					}
				})
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
							$('#text').append(`<br><br><p>Congratulazioni il punteggio totalizzato è di ${this.obj[2]}/${this.obj[3]} punti!`)
							this.over = true;
							this.points = this.obj[2];
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
					if(this.obj) {
						this.instruction = true;
						this.verify = false;
					}
				}
			}
		},
		getNameByCookie(){
			let cook_str = document.cookie;
			let cook_list = cook_str.split(';');
			let name = "";
			cook_list.forEach(x =>{
				x = x.trim();
				if(x.startsWith('userId'))name = x.split('=')[1];
			})
			return name;
		}
	},
	activated() {
		this.myName = this.getNameByCookie();
		storyItem = JSON.parse(localStorage.getItem("story"));
		this.missions = storyItem.missions;
		let first = render.methods.initialize();
		this.currentMission = first[0];
		this.currentActivity = first[1];

		//request for getting new name if exist
		$.ajax({
			type: "GET",
			url: '/Play/getNewName',
			success: (data) =>{
				if(data)this.myName = data;
				$('#text').html(`<p>Ciao ${this.myName}, <br>${storyItem.introduction}</p>`);

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