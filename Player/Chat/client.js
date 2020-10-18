	
const sock = io();

let app = new Vue({
  el: '#app',
  data:{
    newMess: null,
    messages:[]
  },
  methods:{
    //type 0 is for the message that i send to the staff, 1 for those the users receive
    onChatSubmitted(){
      this.messages.push({mess:this.newMess,type:0});
      sock.emit('chat-message',this.newMess);
      this.newMess = null;
    },
    //simply clear the array of messages
    clearChat(){
      this.messages = [];
    }
  },
  created(){
    //listening for the messages that will arrive
    sock.on('message',(data) => {
      this.messages.push({mess:data,type:1});
    })

    sock.on('set_cookie', (cookie) => {
      document.cookie = cookie;
    });
  }
})
