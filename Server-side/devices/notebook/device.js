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
			over: false
        }
	},
	template: ` 
        <div class="notebook">
            <div class="note">
                <div id="text"> </div>
				<div class="post-it">
					<div id="container" class="sticky taped">
					</div>
				</div>
                <button id="next" @click="next"> &rarr; </button>
            </div>
        </div>
    `,
	methods: {

		next() {
			if(this.over) {
				bus.$emit('over','true'); 
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
							$('#text').append(`<br><br><p>Congratulazioni hai totalizzato ${this.obj[2]} punti!`)
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
		storyItem = JSON.parse(localStorage.getItem("story"));
		this.missions = storyItem.missions;
		$('#text').text(storyItem.introduction);
		render.methods.initialize();
		
	}
}