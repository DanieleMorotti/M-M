	
export default {
  name: 'chat-user',
  data:{
    newMess: null,
    messages:[],
    sock:null
  },
  template:`
    <div id="chat-user">
    
        <div id="chat" class="controls-wrapper">
            <ul id="events"  v-chat-scroll>
                <li class="defaultMes">You are online</li>
                <li v-for="mess in messages" :key="mess.id"
                v-bind:class="{'myMes': mess.type == 0,'otherMes': mess.type == 1}">{{mess.mess}}</li> 
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
