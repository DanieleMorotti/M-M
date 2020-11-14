const sock = io.connect('/staff');

const bus = new Vue();

new Vue({
    el: '#chatMenu',
    data() {
        return{
            newMess: null,
            users: [],
            blockUsers:[],
            //for default the chat of the first user is shown
            currRoom: 0,
            servSent: null
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
                                <a class="list-group-item list-group-item-action rounded-0">
                                    <div class="media">
                                        <img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                                        <div class="media-body ml-4">
                                            <div class="d-flex align-items-center justify-content-between mb-1">
                                            <h6 class="mb-0">{{user.id}}</h6>
                                            <span class="badge badge-danger"></span>
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
            $('.media .badge').eq(this.currRoom).text('');
        },
        //change the current chat to the 'id' chat 
        enterChat(id,i){
            //the i parameters is inserted only in the notify menu
            if(Number.isInteger(i)){
                $('#onlyNot > ul > li').eq(i).css('text-decoration','line-through');
            }
            let index = this.users.findIndex(item => item.id === id);
            this.currRoom = index;
            $('.media .badge').eq(index).text('');
        },
        sortRecent(ind){
            if(ind > 0){
                //move the user who receive a message to the top position
                this.users.unshift(this.users.splice(ind,1)[0]);
                //because all the users are shifted by 1, if i'm not in the moved chat
                if(this.currRoom != ind)this.currRoom++;
                else this.currRoom = 0;
            }
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
                bus.$emit('first-upd-us',list); 
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
                else{
                    this.users.push({id:usName,messages:[]});
                    bus.$emit('upd-us', usName);
                }
                sock.emit('join-room',usName);
            }
        })
        //when an user is disconnected i delete it from the list
        sock.on('disc-user',(id) =>{
           let toDel = this.users.findIndex(item => item.id === id);
           this.users.splice(toDel,1);
           bus.$emit('del-user', id);
        })
        
        sock.on('message',(data) => {
            //finding the position in the list of users and push the messages
            let i = this.users.findIndex(item => item.id === data.from);
            this.users[i].messages.push({mess:data.mess,type:1});
            $('.media .badge').eq(i).text('NEW');
            this.sortRecent(i);
        })

        this.servSent = new EventSource('/Valutatore/needRequests');
        
    },
    mounted(){
        this.servSent.onmessage = (event) => {
            let arr = JSON.parse(event.data);
            if(arr.needHelp)this.blockUsers = arr.needHelp.slice();
        };

        this.servSent.onerror = function(err) {
            console.log("Server sent failed: /needRequests", err);
        };
    }
})

new Vue({
    el: '#valutaMenu',
    data() {
        return{
            requests:[],
            modalInfo: {id:"Nome utente",time:"1/1/2000, 00:00:00",type:"testo",content:"contenuto"},
            evaluation:6,
            servSent:null
        }
    }, 
    template: `
        <div class="container-fluid">
            <div class="container m-3" v-if="requests.length != 0">
                <div class="card val-request" v-for="user in requests" v-bind:key="user.id">
                    <div class="card-header"> {{user.id}} </div>
                    <div class="card-body">
                        <p class="card-text">Inviato: {{user.time}}</p>
                        <p>Tipo: {{user.type}}</p>
                        <a href="#" type="button" class="btn btn-primary" data-toggle="modal" data-target="#valutaModal" @click="updateQuest(user)">VALUTA</a>
                    </div>
                </div>
            </div>
            <p v-else>Ancora nessuna risposta da valutare </p>

            <!-- Modale per la valutazione -->
            <div class="modal fade" id="valutaModal" aria-hidden="true" role="dialog" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{modalInfo.id}}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>Domanda: <span>{{modalInfo.question}}</span</p>
                            <p>Risposta da valutare:</p> 
                            <div>
                                <img class="img-fluid w-75 mx-auto d-block" v-if="modalInfo.type === 'immagine'" v-bind:src="'/Server-side/valuta/img/' + modalInfo.content" >
                                <span v-else>{{modalInfo.content}}</span>
                            </div>
                        </div>
                        <div style="border:2px solid black;padding:1rem">
                            <label for="points">Punti assegnati: </label>
                            <input type="range" id="points" value="6" min="1" max="10" v-model="evaluation">&nbsp;&nbsp;
                            <span v-text="realtimeNumber"></span>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" @click="sendEvaluation">Invia valutazione</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        realtimeNumber: function () {
            return this.evaluation;
        }
    },
    methods: {
        updateQuest(userInfo){
            //userInfo composed by id,time,type and content fields
            this.modalInfo = userInfo;
            $('#points').val(6);
        },
        sendEvaluation(){
            let mark = $('#points').val();
            let usr = this.modalInfo.id;
            $.ajax({
                type: "POST",
                url: "/Valutatore/evaluationDone",
                data: {
                    id: usr,
                    mark: mark
                },
                success: (data) =>{
                    this.requests.splice(this.requests.findIndex(x => x.id === usr),1);
                },
                error: function (e) {
                    console.log("error in sending evaluation");
                }
            });
            $('#valutaModal').modal('hide');
        }
    },
    created(){
        this.servSent = new EventSource('/Valutatore/needRequests');
    },
    mounted(){
        this.servSent.onmessage = (event) => {
            let parsedData = JSON.parse(event.data);
            //only the array requested i'm interested in
            if(parsedData.needEval){
                let arr = parsedData.needEval;
                if(JSON.stringify(arr) === JSON.stringify(this.requests)){
                    console.log("nessuna nuova richiesta da valutare");
                }else{
                    this.requests = arr.slice();
                }
            }
        };

        this.servSent.onerror = function(err) {
            console.log("Server sent failed: /evaluationDone", err);
        };
    }
})


new Vue({
    el: '#optionMenu',
    data() {
        return{
            users: [],
            usWin: [],
            storyName: null
        }
    }, 
    template: `
        <div class="container-fluid">
            <div class="container" id="changeNameMenu">
                <div class="container"  v-if="users.length != 0">
                    <h3>Cambia come preferisci i nomi dei giocatori che stanno giocando a "{{storyName}}"</h3>
                    <table class="table">
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user,ind) in users" v-bind:key="user.id">
                                <th scope="row">{{ind+1}}</th>
                                <td>{{Object.keys(user)[0]}}</td>
                                <td class="editableName"><span>{{Object.values(user)[0]}}</span> &nbsp;<i tabindex="0" class="fas fa-edit" 
                                    @click="editName(ind)" ></i><button type="button" 
                                    class="btn btn-info" style="display:none" @click="saveName(ind,Object.values(user)[0])">SALVA</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-else>Ancora nessun giocatore connesso</p>
            </div>
            <div class="container" id="printResults">
                <h4>Stampa i risultati della partita, solamente i giocatori che hanno già terminato saranno presenti </h4>
                <ul class="list-group" v-if="usWin.length != 0">
                    <li class="list-group-item" v-for="us in usWin">{{us.name}}</li>
                </ul>
                <button @click="verifyWhoFinished">Verifica chi ha finito</button>
            </div>
        </div>
    `,
    methods: {
        
        editName(index){
            $('.editableName > span').eq(index).attr('contenteditable','true');
            $('.editableName > i').eq(index).hide();
            $('.editableName > button').eq(index).show();
        },
        //save the new name and communicate to the player
        saveName(index,id){
            $('.editableName > span').eq(index).attr('contenteditable','false');
            $('.editableName > i').eq(index).show();
            $('.editableName > button').eq(index).hide();

            let newName = $('.editableName > span').eq(index).text();
            this.users[index][id] = newName;
            
            $.ajax({
                type: "POST",
                url: "/Valutatore/changeName",
                data: {
                    id: id,
                    newName: newName    
                },
                success: (data) =>{
                    console.log("Grande valutatore, hai cambiato il nome a ",id);
                },
                error: function (e) {
                    console.log("error in sending newname");
                }
            });
        },
        verifyWhoFinished(){
            $.ajax({
                type: "GET",
                url: "/Valutatore/whoFinished",
                success: (data) =>{
                    if(data.length != 0){
                        this.usWin = data.slice();
                    }
                    console.log("get the list of players have finished");
                },
                error: function (e) {
                    console.log("error in whoFinished");
                }
            });
        }
    },
    created(){
        //get the list of users on first connection
        bus.$on('first-upd-us', (arr) => { 
            arr.forEach(us => {
                let index = this.users.push({[us]:us});
            });
        });
    },
    mounted(){
        //update users list when a new player join the game; [name] computed property names es6
        bus.$on('upd-us', (name) => { 
            let index = this.users.push({[name]:name})
        });

        //delete user from the list when it's disconnected
        bus.$on('del-user', (toDel) => { 
            let i = this.users.findIndex(obj => Object.keys(obj)[0] === toDel);
            this.users.splice(i,1);
        });

        sock.once('current-story',(storyName)=>{
            this.storyName = storyName;
        })
    }
})