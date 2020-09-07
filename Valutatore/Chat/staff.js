
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
        //find the index of the user i need to chat with(i need this method because i used array instead of dictionary ;) )
        findIndex(newId){
            let i = 0;
            while( i < this.users.length){
                if(this.users[i].id === newId){
                    break;
                }
                i++;
            }
            return i;
        },
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
            this.currRoom = this.findIndex(id);
        }
    },
    created(){
        //when the staff update for the first time the list of users
        //TODO: possiamo aggiungere che se un user è connesso prima dello staff(impossibile?) ci salviamo i messaggi inviati prima e li mostriamo appena si connette lo staff
        sock.on('first-connection',(list) => {
            if(list){
                for(let i=0; i< list.length;i++){
                    if( sock.id !== ('/staff#'+list[i].id)){
                        this.users.push({id:list[i].id,messages:[]});
                        //i need to join the room immediatly,if not when the user types before i click on his button i don't receive any messages
                        sock.emit('join-room',list[i].id);
                    }
                }
            }
        })
        //everytime a user is connected i update the list with the user id and his room
        sock.on('update-users',(data) =>{
            //if is not the message sent for my firts connection i update the array
            if(('/staff#'+data) !== sock.id){
                this.users.push({id:data,messages:[]});
                sock.emit('join-room',data);
            }
        })
        //when an user is disconnected i delete it from the list
        sock.on('disc-user',(id) =>{
           let toDel = this.findIndex(id);
           this.users.splice(toDel,1);
        })
        
        sock.on('message',(data) => {
            //finding the position in the list of users and push the messages
            this.users[this.findIndex(data.from)].messages.push({mess:data.mess,type:1});
        })

    }
})
