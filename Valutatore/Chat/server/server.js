const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cookie = require('cookie');

const app = express();
const server = http.createServer(app);
const io = socketio().listen(server,{cookie:false});

const myfunctions = require('../function');
const { usersList } = require('../function');
var idNum = 1;
var cookieNum = 1;
var numStaff = 1;
let isStaff = false;

//modified the function which generate the socket id
io.engine.generateId = function (req) {
	idNum++;
    return 'user'+idNum;
}

////////////////////////////////////////////////////////////////////
//SERVER SECTION
///////////////////////////////////////////////////////////////////

//on controller side i need to create button for every user and i create a socket in the same room as is indicated in the button(user1,2 etc)
app.use(express.static(`${__dirname}/../client`)); 
app.use(express.static(`${__dirname}/..`));

app.get('/staff', function(req,res){
	//TODO:pericoloso, perchè se accedono contemporaneamente 1 dello staff e uno no, diventano tutte dello staff
	isStaff = true;
	res.sendFile('C:/Users/danie/Desktop/Esperimenti/Chat/staff.html');
} )

app.get('/', function(req,res){
	res.sendFile('C:/Users/danie/Desktop/Esperimenti/Chat/client/index.html');
} )

let cookies;
//every time someone connect to the server
io.on('connection', (sock) => {
	//get the cookies from the client and parse them if exist
	cookies = sock.request.headers.cookie;
	if(cookies)cookies = cookie.parse(cookies);

	//username is saved different for every socket
	let cookieVal,userName;

	//set the cookies for the users
	if(!isStaff){
		if(cookies && cookies.userId){
			console.log("Ho già cookies:",cookies);
			sock.emit('set_cookie', cookie.serialize('userId',cookies.userId));
			userName = cookies.userId;
		}else{
			console.log("non ho cookies sono appena entrato");
			//set the cookie for the client
			cookieVal = cookie.serialize('userId', 'user'+cookieNum);
			userName = 'user'+cookieNum;
			cookieNum++;
			sock.emit('set_cookie', cookieVal);
		}
		//update the staff list only the first time
		io.of('/staff').emit('update-users',userName);
			
		myfunctions.userJoin(userName);
	}else{
		if(cookies && cookies.staffId){
			userName = cookies.staffId;
		}else{
			userName = 'staff'+numStaff;
		}
	}

	//every user need to have a private chat with the staff so he will join a private room
	sock.join(userName);

	//catch the messages from the users and send them to the staff
	sock.on('chat-message',(text)=> io.of('/staff').emit('message',{mess:text,from:userName}));
	
	//when a user is disconnected the server tell the staff to delete him from the list
	sock.on('disconnect',() => {
		myfunctions.removeUser(userName);
		io.of('/staff').emit('disc-user',userName);
		console.log(userName + ' is disconnected');
	}) 

});

//this is the namespace to manage the staff
var staffSpace = io.of('/staff');

staffSpace.on('connection', function(sock){
	//manage cookie
	if(cookies && cookies.staffId){
		console.log("Ho già cookies(staff):",cookies);
		cookieVal = cookie.serialize('staffId', cookies.staffId);
		sock.emit('set_cookie',cookieVal);
		username = cookies.staffId;
	}else{
		console.log("non ho cookies sono appena entrato(staff)");
		//set the cookie for the staff
		cookieVal = cookie.serialize('staffId', 'staff'+numStaff);
		sock.emit('set_cookie', cookieVal);
		username = 'staff'+numStaff;
		numStaff++;
	}
	isStaff = false;

	//on the first connection the staff is informed about the users that are connected yet
	sock.emit('first-connection',usersList);

	//when the staff join that unique room
	sock.on('join-room',(id) => {
		sock.join(id);
	});
	//this manage the message that the staff sends and the server sends too to the selected room(data.to)
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