	
export default {
  name: 'chat-user',
  data:{
    newMess: null,
    messages:[],
    sock:null
  },
  methods:{
    //type 0 is for the message that i send to the staff, 1 for those the users receive
    onChatSubmitted(){
      this.messages.push({mess:this.newMess,type:0});
      this.sock.emit('chat-message',this.newMess);
      this.newMess = null;
    },
    //simply clear the array of messages
    clearChat(){
      this.messages = [];
    }
  },
  created(){
    this.sock = io();
    //listening for the messages that will arrive
    this.sock.on('message',(data) => {
      this.messages.push({mess:data,type:1});
    })
  }
}
