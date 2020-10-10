
const sock = io.connect('/staff');

let app = new Vue({
    el: '#staff',
    data:{
        newMess: null,
        users: [],
        //for default the chat of the first user is shown
        currRoom: 0
    },
    methods:{
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
    created(){

        sock.on('set_cookie', (cookie) => {
            console.log(JSON.stringify(cookie));
            document.cookie = cookie;
        });
        //when the staff update for the first time the list of users
        //TODO: possiamo aggiungere che se un user è connesso prima dello staff(impossibile?) ci salviamo i messaggi inviati prima e li mostriamo appena si connette lo staff
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
            //update the users array, only if it's not a page refresh(the user is already in)
            if(this.users.some(item => item.id === usName));
            else this.users.push({id:usName,messages:[]});
            sock.emit('join-room',usName);
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

        

    }
})
