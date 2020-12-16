const sock = io.connect('/staff');

const bus = new Vue();

new Vue({
    el: '#chatMenu',
    data() {
        return{
            newMess: null,
            users: [],
            blockUsers:[],
            currRoom: 0,
            servSent: null,
            opened: false
        }
    }, 
    template: `
    <div id="chatNotif">
        <div class="chatContainer d-inline-block" >
            <div class="row rounded-lg overflow-hidden shadow" style="height:100% !important;width:100% !important; margin: auto">
                <!-- Users box-->
                <div id="users" class="px-0">
                    <div v-if="users.length != 0">
                        <div class="messages-box" v-for="user in users" v-bind:key="user.id" @click="enterChat(user.id)">
                            <div class="list-group rounded-0">
                                <a class="list-group-item list-group-item-action rounded-0" style="border:0">
                                    <div class="media">
                                      <i class="fas fa-user-circle"></i>
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
                <div id="chatView" class="px-0">
                    <div id="name"><button id="back" @click="displayUsers"> &larr;</button><span>user</span></div>
                    <div class="mainContainer">
                        <div class="container-fluid" style="overflow: auto;height:78% " v-chat-scroll>
                            <div class="chat-box">
                                <!-- Messages-->
                                <div class="media mb-3" id="events" v-if="users.length != 0">
                                    <div class="media-body " v-if="users[currRoom].messages && opened" >
                                        <div class="rounded py-2 px-3 mb-2" v-for="message in users[currRoom].messages" v-bind:key="message.id" 
                                        v-bind:class="{'myMes': message.type == 0,'otherMes': message.type == 1}">
                                            <p class="text-small mb-0">{{message.mess}}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Typing area -->
                        <form @submit.prevent="onChatSubmitted" class="sendInput">
                            <div class="input-group">
                                <input type="text" placeholder="Type a message"  class="form-control rounded-0 border-0 py-4" v-model="newMess" title="chat" style="background-color:transparent" required disabled>
                                <div class="input-group-append">
                                    <button id="button-addon2" type="submit"> <i class="fa fa-paper-plane"></i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
            </div>
        </div>
        <div id="alertMenu" class="overlay">
            <a href="javascript:void(0)" class="closebtn" @click="closeNav">&times;</a>
            <div class="overlay-content" v-if="blockUsers.length != 0">
                <span id="alertMenuTitle">Notifiche utenti</span>
                <nav id="notifNav" v-chat-scroll> 
                    <ul class="list-group" >
                        <li class="list-group-item list-notifications" v-for="(user,i) in blockUsers" v-bind:key="user.id" @click="enterChat(user.who,i)">
                            <p v-if="user.where">{{user.who}} ha bisogno nella missione {{user.where.currMission}}, attività {{user.where.currAct}}</p>
                            <p v-else>{{user.who}} ha richiesto aiuto</p>
                        </li>
                    </ul>
                </nav>
            </div>
            <div v-else class="overlay-content"><span>Nessuna notifica</span></div>
        </div>
        <button id="alertBtn" @click="openNav"><i class="fas fa-exclamation-circle"></i></button>
    </div>
    `,
    methods: {
        /* open/close sidenav to show notifications on mobile */
        openNav() {
            document.getElementById("alertMenu").style.width = "100%";
            document.getElementById("alertMenu").style.display = "block";
        },
        closeNav() {
            document.getElementById("alertMenu").style.width = "0%";
            document.getElementById("alertMenu").style.display = "none";
        },
        //display users if you are on mobile 
        displayUsers() {
            if ( $('#users').css('display') == 'none' ) {
                $('#users').css("display","block")
                $('#chatView').css("display","none")
            }
        },
        displayChat(user) {
            $('#name span').text(user);
            if ( $('#chatView').css('display') == 'none' ) {
                $('#users').css("display","none")
                $('#chatView').css("display","block")
            }
        },
        //save the messages of the staff and send them to the server
        onChatSubmitted(){
            //i can't send message if there isn't any player
            if(this.users.length != 0){
                this.users[this.currRoom].messages.push({mess:this.newMess,type:0});
                sock.emit('staff-chat-message',{to:this.users[this.currRoom].id,mess:this.newMess});
                this.newMess = null;
                $('.media .badge').eq(this.currRoom).text('');
            }
        },
        //change the current chat to the 'id' chat 
        enterChat(id,i){
            /* variable is true if chat has been opened at least one time */
            this.opened = true;

            /* enable input */
            $(".sendInput input[type='text']").attr('disabled', false)

            /* on mobile devices */
            this.displayChat(id);

            /* if sidenav opened */
            if(document.getElementById("alertMenu").style.width == '100%') {
                this.closeNav();
                /* hide users display chat */

                $('#users').css("display","none")
                $('#chatView').css("display","block")
            }
            //the i parameters is inserted only in the notify menu
            if(Number.isInteger(i)){
                $('#notifNav > ul > li').eq(i).css('text-decoration','line-through');
            }
            let index = this.users.findIndex(item => item.id === id);
            $(`#users .messages-box:nth-child(${this.currRoom+1}) a`).removeClass("activeLink");
            this.currRoom = index;
            $(`#users .messages-box:nth-child(${index+1}) a`).addClass("activeLink");
            $('.media .badge').eq(index).text('');
        },
        //put the user with the most recent notification to the top of the list
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
           if(toDel >= 0)this.users.splice(toDel,1);
           bus.$emit('del-user', id);
           //to avoid error in chat because i'm reading messages of null
           if(id == this.currRoom)this.currRoom = 0;
        })
        
        sock.on('message',(data) => {
            //finding the position in the list of users and push the messages
            let i = this.users.findIndex(item => item.id === data.from);
            this.users[i].messages.push({mess:data.mess,type:1});
            $('.media .badge').eq(i).text('NEW');
            this.sortRecent(i);
        })

        sock.on('refresh-page',(data)=>{
            //reinitialize all the variables when a new story begin
            this.users = [];
            this.newMess = null;
            this.blockUsers = [];
            this.currRoom = 0;
        })
        this.servSent = new EventSource('/Valutatore/needRequests');
        
    },
    mounted(){
        //get the data when a new user is blocked
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
                        <a href="#" type="button" class="cardBtn" data-toggle="modal" data-target="#valutaModal" @click="updateQuest(user)">VALUTA</a>
                    </div>
                </div>
            </div>
            <p class="info-para" v-else>Ancora nessuna risposta da valutare </p>

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
                        <div style="padding:1rem">
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
        //if a user needs help i get the data
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

        sock.on('refresh-page',(data)=>{
            //reinitialize all the variables when a new story begin
            this.requests = [];
            this.modalInfo = {id:"Nome utente",time:"1/1/2000, 00:00:00",type:"testo",content:"contenuto"};
        })
    }
})


new Vue({
    el: '#optionMenu',
    data() {
        return{
            users: [],
            usWin: [],
            storyName: null,
            jsonName:null,
            countTime:1,
            numToDeact:0
        }
    }, 
    template: `
        <div class="container-fluid">
            <div id="changeNameMenu">
                <div  v-if="users.length != 0">
                    <h3>Cambia come preferisci i nomi dei giocatori che stanno giocando a "{{storyName}}"</h3>
                    <table>
                        <thead>
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
                <div v-else>Ancora nessun giocatore connesso</div>
            </div>
            <div id="printResults">
                <h3>Stampa i risultati della partita, solamente i giocatori che hanno già terminato saranno presenti. </h3>
                <table>
                    <caption> CLASSIFICA </caption>
                    <thead>
                        <tr>
                            <th>Posizione</th>
                            <th scope="col" >Id</th>
                            <th scope="col" >Nome</th>
                            <th scope="col" >Punti</th>
                            <th scope="col" >Tempo impiegato</th>
                        </tr>
                    </thead>
                    <tbody v-if="usWin.length != 0">
                        <tr v-for="(us,ind) in usWin" v-bind:key="us.id">
                            <td>{{ind+1}}</td>
                            <td>{{us.id}}</td>
                            <td>{{us.assignedName}}</td>
                            <td>{{us.points}}</td>
                            <td>{{us.time_minutes}} minuti</td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <th scope="row" colspan="4">Ancora nessun giocatore ha terminato, clicca per controllare.</th>
                        </tr>
                    </tbody>
                </table>
                <div id="settButtonDiv">
                    <button class="settingsBtn" @click="verifyWhoFinished">Verifica chi ha finito</button>
                    <button class="settingsBtn" data-toggle="modal" data-target="#endGameModal" >Concludi partita</button>
                    <button class="settingsBtn" ><a id="linkForPrint" href="/Server-side/valuta/results/vuoto.txt" target="_blank" download>STAMPA RISULTATI</a></button>
                </div>
            </div>

            <!--modale per chiedere conferma di chiusura della partita-->
            <div class="modal fade" id="endGameModal" aria-hidden="true" role="dialog" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chiudi partita</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>Vuoi scaricare il file dei giocatori che hanno già concluso la partita?</p>
                            <a href='/Server-side/valuta/results/vuoto.txt' target="_blank" download>Scarica qui il json!</a>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" @click="endGame">CHIUDI PARTITA</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        //enable the contenteditable attribute
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
                    let users = data.users;
                    let pathJson = data.jsonName;
                    if(users.length != 0){
                        this.usWin = users.slice();
                        //make a ranking of the players
                        this.usWin.sort((el1,el2)=>{
                            if((el1.points / el1.time_minutes) >= (el2.points / el2.time_minutes))return el1;
	                        return el2;
                        })
                    }
                    //change only the first time the attribute
                    if(this.countTime > 0){
                        this.jsonName = pathJson;
                        $('.modal-body > a').attr('href',pathJson);
                        $('#linkForPrint').attr('href',pathJson);
                        this.countTime--;
                    }
                    console.log("get the list of players have finished");
                },
                error: function (e) {
                    console.log("error in whoFinished");
                }
            });
        },
        endGame(){
            $.ajax({
                type: "POST",
                url: "/Valutatore/endGame",
                success: (data) =>{
                    console.log("Partita conclusa correttamente");
                    $('#endGameModal').modal('hide');
                },
                error: function (e) {
                    console.log("error in endgame");
                }
            });
        },
        //disable the icon to change the name of the player after 15 seconds he entered the game
        deactivateChange(ind){
            setTimeout(()=>{
				$(`.editableName > span:eq(${ind})`).attr('contenteditable','false');
                $(`.editableName > i:eq(${ind})`).hide();
                $(`.editableName > button:eq(${ind})`).hide();
			},15000);
        }
    },
    created(){
        //get the list of users on first connection
        bus.$on('first-upd-us', (arr) => { 
            arr.forEach(us => {
                this.users.push({[us]:us});
                this.deactivateChange(this.numToDeact);
                this.numToDeact++;
            });
        });
    },
    mounted(){
        //update users list when a new player join the game; [name] computed property names es6
        bus.$on('upd-us', (name) => { 
            this.users.push({[name]:name})
            this.deactivateChange(this.numToDeact);
            this.numToDeact++;
        });

        //delete user from the list when it's disconnected
        bus.$on('del-user', (toDel) => { 
            let i = this.users.findIndex(obj => Object.keys(obj)[0] === toDel);
            this.users.splice(i,1);
        });

        //i need only one message because all the players play the same story
        sock.on('current-story',(storyName)=>{
            if(this.storyName === storyName) ;
            else this.storyName = storyName;
        })

        sock.on('refresh-page',(data)=>{
            //reinitialize all the variables when a new story begin
            this.users= [];
            this.usWin= [];
            this.storyName= null;
            this.numToDeact = 0;
        })
    }
})