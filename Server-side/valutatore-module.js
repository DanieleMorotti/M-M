const valutatore = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const sharedVar = require('./funcAndVar').sharedVariables;
const sharedFunc = require('./funcAndVar').sharedFunctions;

//return the players who asked help and the players who need help because blocked in an activity 
valutatore.get('/needRequests',(req,res) =>{
	//set all headers for server-sent
	res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader("Access-Control-Allow-Origin", "*");
	res.flushHeaders(); // flush the headers to establish SSE with client
	
	let prev = [];

	let interv = setInterval(()=>{
		let who = [];
		sharedVar.partecipants.forEach(el => { if(el.needHelp)who.push({who:el.id,where:el.position});});
		who = sharedVar.askingHelp.concat(who);
		//if the array is equal to the array in the last control
        if (JSON.stringify(who) !== JSON.stringify(prev)) {
			res.write('data:{"needHelp":'+JSON.stringify(who)+'}\n\n'); // res.write() instead of res.send()
			prev = who.slice();
		}
		res.write('data:{"needEval":'+JSON.stringify(sharedVar.toEval)+'}\n\n');
	},5000);
	
    // If client closes connection, stop sending events
    res.on('close', () => {
		console.log('valutatore dropped server-sent');
		clearInterval(interv);
		res.end();
    });
	
})

valutatore.post('/evaluationDone',(req,res)=>{
	let mark = req.body.mark;
	let userName = req.body.id;
	sharedVar.toEval.splice(sharedVar.toEval.findIndex(us => us.id === userName),1);
	sharedVar.evaluated.push({id:userName,mark:mark});
	console.log("Rimozione dall'array di valutazione");
	res.end();
})


//listOfAssociatedNames is defined as the list of pair id-name
valutatore.post('/changeName',(req,res)=>{
	let data = req.body;
	
	//push the new association id-name
	sharedVar.listOfAssociatedNames.push({[data.id]:data.newName});
	res.end();

})

//verify the players that ended the game,@endPlayers has id,assignedName,points,time_minutes fields
valutatore.get('/whoFinished',(req,res)=>{
	let obj = {users:sharedVar.endPlayers,jsonName:'/Server-side/valuta/results/'+sharedVar.jsonResName}
	res.json(obj);
})

//manually end the current game
valutatore.post('/endGame',(req,res)=>{
	sharedFunc.reinitializeVariables();
	res.end();
})


/*
        CHAT SECTION
*/
valutatore.get('/', function(req,res){
	//pericoloso, perchè se accedono contemporaneamente 1 dello staff e uno no, diventano tutte dello staff
	sharedVar.isStaff = true;
	sharedVar.cookies = req.cookies;

	if(sharedVar.cookies && sharedVar.cookies.staffId){
		console.log("Sono dello staff, ho già cookie",sharedVar.cookies.staffId);
		res.cookie('staffId',sharedVar.cookies.staffId,{path:'/Valutatore'});
	}else{
		console.log("non ho ancora cookie(staff)");
		res.cookie('staffId','staff'+sharedVar.numStaff,{path:'/Valutatore'});
	}
	res.sendFile(path.join(__dirname,'../Valutatore/valutatore.html'));
} )


//this is the namespace to manage the staff
var staffSpace = sharedVar.io.of('/staff');

staffSpace.on('connection', function(sock){
	
	sharedVar.isStaff = false;

	//on the first connection the staff is informed about the users that are connected yet,if a user is already here i send the name of the story
	if(sharedVar.story){
		sock.emit('current-story',sharedVar.story);
	}
	sock.emit('first-connection',sharedVar.usersList);

	//when the staff join that unique room
	sock.on('join-room',(id) => {
		sock.join(id);
	});
	//this manage the message that the staff sends and the server sends too to the selected room(data.to)
	sock.on('staff-chat-message',(data)=>{
		sharedVar.io.of('/').to(data.to).emit('message',data.mess);
	})
});

module.exports = valutatore;