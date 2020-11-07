const sock = io.connect('/staff');

new Vue({
    el: '#chatMenu',
    data() {
        return{
            newMess: null,
            users: [],
            blockUsers:[],
            //for default the chat of the first user is shown
            currRoom: 0
        }
    }, 
    template: `
    <div id="chatNotif">
        <div class="container py-4 px-4 ml-4 d-inline-block" style="height:80% !important">
            <div class="row rounded-lg overflow-hidden shadow" style="height:100% !important;width:100% !important;">
                <!-- Users box-->
                <div class="col-5 px-0">
                    <div class="bg-white" v-if="users.length != 0">
                        <div class="messages-box" v-for="user in users" v-bind:key="user.id" @click="enterChat(user.id)">
                            <div class="list-group rounded-0">
                                <a class="list-group-item list-group-item-action active text-white rounded-0">
                                    <div class="media"><img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                                        <div class="media-body ml-4">
                                            <div class="d-flex align-items-center justify-content-between mb-1">
                                            <h6 class="mb-0">{{user.id}}</h6>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Chat Box-->
                <div class="col-7 px-0">
                    <div class="container-fluid" style="overflow: auto;height:85% !important" v-chat-scroll>
                        <span class="defaultMes">Staff member</span>
                        <div class="px-4 py-5 chat-box bg-white">
                            <!-- Messages-->
                            <div class="media mb-3" id="events" v-if="users.length != 0">
                                <div class="media-body " v-if="users[currRoom].messages" >
                                    <div class="bg-light rounded py-2 px-3 mb-2" v-for="message in users[currRoom].messages" v-bind:key="message.id" 
                                    v-bind:class="{'myMes': message.type == 0,'otherMes': message.type == 1}">
                                        <p class="text-small mb-0">{{message.mess}}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Typing area -->
                    <form @submit.prevent="onChatSubmitted" class="bg-light">
                        <div class="input-group">
                            <input type="text" placeholder="Type a message"  class="form-control rounded-0 border-0 py-4 bg-light" v-model="newMess" title="chat" required>
                            <div class="input-group-append">
                                <button id="button-addon2" type="submit" class="btn btn-link"> <i class="fa fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </form>
                </div>
                
            </div>
        </div>
        <div id="notMenu" class="d-inline-block">
            <div class="h-100" v-if="blockUsers.length != 0">
                <span id="notMenuTitle">Notifiche utenti</span>
                <nav id="onlyNot" v-chat-scroll> 
                    <ul class="list-group" >
                        <li class="list-group-item" v-for="(user,i) in blockUsers" v-bind:key="user.id" @click="enterChat(user.who,i)">
                            <span v-if="user.where">{{user.who}} ha bisogno nella missione {{user.where.currMission}}, attività {{user.where.currAct}}</span>
                            <span v-else>{{user.who}} ha richiesto aiuto</span>
                        </li>
                    </ul>
                </nav>
            </div>
            <span v-else>Nessuna notifica </span>
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
        //change the current chat to the 'id' chat 
        enterChat(id,i){
            //the i parameters is inserted only in the notify menu
            if(Number.isInteger(i)){
                $('#notMenu > div > ul > li').eq(i).css('text-decoration','line-through');
            }
            this.currRoom = this.users.findIndex(item => item.id === id);
        }
    },
    created() {
        
        //when the staff update for the first time the list of users
        sock.on('first-connection',(list) => {
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
                url: '/Valutatore/whoNeedHelp',
                success: (data) =>{
                    //update the blocked user
                    this.blockUsers = data.slice();                              
                },
                error: function (e) {
                    console.log("error in /whoNeedHelp request",e);
                }
            })
        }, 5000);
    }
})


/*new Vue({
    el: '#valutaMenu',
    data() {
        return{
            
        }
    }, 
    template: `
        
    `,
    methods: {
        
    },
    created() {
    },
    mounted(){
        
    }
})*/
