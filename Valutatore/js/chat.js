//import { bus } from './index.js';
import valComp from './val.js'

const sock = io.connect('/staff');

export default {
    name: 'chatMenu',
    components: valComp,
    data() {
        return{
            newMess: null,
            users: [],
            //for default the chat of the first user is shown
            currRoom: 0
        }
    }, 
    template: `
        <div id="chatMenu" class="container">
            <div id="chatHome">
                <ul v-if="users.length != 0">
                    <li v-for="user in users" v-bind:key="user.id"><button @click="enterChat(user.id)">{{user.id}}</button></li>
                </ul>
            </div>
        
            <div id="chat-staff" class="controls-wrapper">
                <ul id="events" v-if="users.length != 0" v-chat-scroll>
                    <li class="defaultMes">Staff member</li>
                    <div v-if="users[currRoom].messages">
                        <li v-for="message in users[currRoom].messages" v-bind:key="message.id"
                        v-bind:class="{'myMes': message.type == 0,'otherMes': message.type == 1}">{{message.mess}}</li> 
                    </div>
                </ul>
                <div class="controls">
                    <div class="chat-wrapper">
                        <form id="chat-form" @submit.prevent="onChatSubmitted">
                            <input id="chatInput" autocomplete="off" type="text" v-model="newMess" title="chat" required/>
                            <button type="submit">Send</button>
                            <button type="button" @click="clearChat">Clear</button>
                        </form>
                    </div>
                </div>
            </div>
        </div> 
    `,
    methods: {
        //save the messages of the staff and send them to the server
        onChatSubmitted(){
            this.users[this.currRoom].messages.push({mess:this.newMess,type:0});
            sock.emit('staff-chat-message',{to:this.users[this.currRoom].id,mess:this.newMess});
            this.newMess = null;
        },
        clearChat(){
            this.users[this.currRoom].messages = [];
        },
        //change the current chat to the 'id' chat 
        enterChat(id){
            this.currRoom = this.users.findIndex(item => item.id === id);
        }
    },
    created() {
        
        //when the staff update for the first time the list of users
        sock.on('first-connection',(list) => {
            console.log(JSON.stringify(list,null,2));
            if(list){
                for(let i=0; i< list.length;i++){
                    this.users.push({id:list[i],messages:[]});
                    //i need to join the room immediatly,if not when the user types before i click on his button i don't receive any messages
                    sock.emit('join-room',list[i]);
                }
            }
        })
        //everytime a user is connected i update the list with the user id and his room
        sock.on('update-users',(usName) =>{
            //avoid to add staff to the users list
            if(usName.substring(0,5) === 'staff'){

            }
            else{
                //update the users array, only if it's not a page refresh(the user is already in)
                if(this.users.some(item => item.id === usName));
                else this.users.push({id:usName,messages:[]});
                sock.emit('join-room',usName);
            }
        })
        //when an user is disconnected i delete it from the list
        sock.on('disc-user',(id) =>{
           let toDel = this.users.findIndex(item => item.id === id);
           this.users.splice(toDel,1);
        })
        
        sock.on('message',(data) => {
            //finding the position in the list of users and push the messages
            this.users[this.users.findIndex(item => item.id === data.from)].messages.push({mess:data.mess,type:1});
        })
    },
    mounted(){
        //within mounted because i need access to dom element to notify users difficulties
        setInterval(() => {                
            $.ajax({
                type: "GET",
                url: '/whoNeedHelp',
                success: (data) =>{
                    if(data.length > 0){
                        data.forEach(el => {
                            console.log(el.who+" ha bisogno di aiuto in: "+JSON.stringify(el.where));
                        });
                    }
                    else console.log("tutto tranquillo");
                },
                error: function (e) {
                    console.log("error in /whoNeedHelp request",e);
                }
            })
        }, 5000);
    }
}