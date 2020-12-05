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
			verify: false,
			obj: null,
			over: false,
			myName: null,
			points: null,
			whenStarted: null
        }
	},
	template: ` 
	<div>
        <div class="notebook">
            <div class="note">
                <div id="text"> </div>
				<!--<button id="next" @click="next"> &rarr; </button> -->
				<a href="#" id="toNext"><button id="next" @click="next" class="button-text">&rarr;</button></a>
            </div>
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

				$('#toHome').click();
			}
			else {
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
							$('#text').append(`<br><br><p>Congratulazioni hai totalizzato ${this.obj[2]} punti!`);
							this.points = this.obj[2];
							this.over = true;
						}
						this.obj = null;
					}
					else {
						this.obj = render.methods.verify(this.type,this.currentMission, this.currentActivity);
					}
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
	},
	created(){
		//saving the moment when i started
		this.whenStarted = new Date();
	}
}