const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const myfunctions = require('../function');
const { usersList } = require('../function');
var idNum = 0;

//modified the function which generate the socket id
io.engine.generateId = function (req) {
	idNum++;
    return 'user'+idNum;
}

////////////////////////////////////////////////////////////////////
//SERVER SECTION
///////////////////////////////////////////////////////////////////


//need to make the folders public to serve the files
app.use(express.static(`${__dirname}/../client`)); 
app.use(express.static(`${__dirname}/..`));

app.get('/staff', function(req,res){
	res.status(200);
	res.sendFile(path.join(__dirname,"..","staff.html"));
})

//every time someone connect to the server
io.on('connection', (sock) => {

	io.of('/staff').emit('update-users',sock.id);

	//every user need to have a private chat with the staff so he will join a private room
	var person = myfunctions.userJoin(sock.id);
	sock.join(person.id);

	//catch the messages from the users and send them to the staff
	sock.on('chat-message',(text)=> io.of('/staff').emit('message',{mess:text,from:sock.id}));
	
	//when a user is disconnected the server tell the staff to delete him from the list
	sock.on('disconnect',() => {
		console.log(sock.id + ' is disconnected');
		myfunctions.removeUser(sock.id);
		io.of('/staff').emit('disc-user',sock.id);
	}) 

});

//this is the namespace to manage the staff
var staffSpace = io.of('/staff');

staffSpace.on('connection', function(sock){
	//on the first connection the staff is updated about the users that are connected yet
	sock.emit('first-connection',usersList);
	//when the staff clicks on the user button,it joins that unique room
	sock.on('join-room',(id) => {
		sock.join(id);
	});
	//this manage the messages that the staff sends to the server and the server sends the message to the selected room(data.to)
	sock.on('staff-chat-message',(data)=>{
		io.of('/').to(data.to).emit('message',data.mess);
	})
});

server.on('error', (err) => {
  console.error(err);
});

server.listen(8080, () => {
  console.log('server is listening on 8080');
});