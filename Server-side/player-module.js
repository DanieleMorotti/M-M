const player = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const sharedVar = require('./funcAndVar').sharedVariables;
const sharedFunc = require('./funcAndVar').sharedFunctions;

player.get('/',(req,res,next) =>{
	sharedVar.story = req.query.story;
	//verify if a different story is requested
	if(sharedVar.oldStory && sharedVar.oldStory != sharedVar.story){
		sharedFunc.reinitializeVariables();
	}
	sharedVar.oldStory = sharedVar.story;

	sharedVar.cookies = req.cookies;
	//set the cookies for the users
	if(sharedVar.cookies && sharedVar.cookies.userId){
		console.log("Ho già cookies:",sharedVar.cookies.userId);
		res.cookie('userId',sharedVar.cookies.userId,{path:'/Play'});	
	}else{
		console.log("non ho cookies sono appena entrato");
		//set the cookie for the client
		res.cookie('userId','user'+sharedVar.cookieNum,{path:'/Play', secure: true});
		sharedVar.cookieNum++;
	}

	res.sendFile(path.join(__dirname,"../Player/index.html"));

	//only if this is the first request for this story
	if(sharedVar.firstRequest){
		let resultsObj = {date:new Date().toString(),story:sharedVar.story,users:[]};
		//name the file with the date and the name of the story
		let date = new Date();
		let stringDate =  date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()+'_'+date.getHours()+'_'+date.getMinutes()+'-';
		sharedVar.jsonResName = stringDate + sharedVar.story+'.json';

		//create the json file for the story
		fs.writeFile('./valuta/results/'+sharedVar.jsonResName, JSON.stringify(resultsObj,null,2), 'utf-8', function (err) {
			if (err){
				next(err);
				return;
			}
		});
		sharedVar.firstRequest = false;
	}
})

player.get('/getPlayableStory', (req,res,next) => {
	fs.readFile('./stories/public/'+ sharedVar.story +'/file.json', 'utf8', (err, data) => {  
		if(err){
			next(err);
			return;
		}
		sharedVar.device = JSON.parse(data).device;
		res.set('Content-Type', 'application/json');
		res.status(200).send(data)
	})
})


/*

    SEZIONE AGGIUNTA PER APP VALUTATORE
        
*/

//manage the update of user position
player.post('/updatePlayerPosition',(req,res) => {
	//pos is an object with currMiss and currAct
	let pos = req.body;
	let usName = req.cookies.userId;
	if(usName)usName = usName.substring(0,5);
	else usName = 'undef';
	let index;

	//to avoid access at field 'id' if array has no object
	if(sharedVar.partecipants.length > 0){
		if((index = sharedVar.partecipants.findIndex(x => x.id==usName)) >= 0){
			//if user is in the same position since the last update
			if(JSON.stringify(sharedVar.partecipants[index].position) == JSON.stringify(pos)){
				sharedVar.partecipants[index].time++;
				//if the user is in the same position since a few minutes
				if(sharedVar.partecipants[index].time > 5)sharedVar.partecipants[index].needHelp = true;
			}
			else{
				sharedVar.partecipants[index].position = pos;
				sharedVar.partecipants[index].time = 0;
				sharedVar.partecipants[index].needHelp = false;
			}
		}
		else{
			sharedVar.partecipants.push({id:usName,position:pos,time:0,needHelp:false});
		}
	}
	else{
		sharedVar.partecipants.push({id:usName,position:pos,time:0,needHelp:false});
	}
	res.end();
})

//player ask for help if he doesn't now how to go on
player.post('/askForHelp',(req,res) =>{
	let name = req.cookies.userId;
	if(name)name = name.substring(0,5);
	else name = 'undef';

	sharedVar.askingHelp.push({who:name,where:""});
	res.end();
})

//@formidable_eval new instance for managing requests to evaluate,@toEval array of the requests to evaluate,@evaluated:requests evaluated
const formidable_eval = require('formidable');

//route to receive the users responses to evaluate
player.post('/toEvaluate', (req,res,next) =>{
	var form = new formidable_eval.IncomingForm();//per server unibo{uploadDir: __dirname + '/tmp',keepExtensions:true});

	let id = req.cookies.userId;
	if(id)id = id.substring(0,5);
	else id = 'undef';

	var time = new Date().toLocaleString();
	let reqEval = {id: id,time:time};
	form.parse(req);
	form.on('field', (name, field) => {
			if(name == 'input') {
				reqEval['content'] = field;
				reqEval['type'] = "testo";
			}
			else {
				reqEval['question'] = field;
			}
		})
		.on('fileBegin', function (name, file){
			if(file.name != "") file.path = __dirname+'/valuta/img/' + file.name;
		})
		.on('file', (name, file) => {
			reqEval['content'] = file.name;
			reqEval['type'] = "immagine";
		})
		.on('error', (err) => {
			next(err);
			return;
		})
		.on('end',() => {
			console.log(JSON.stringify(reqEval,null,2));
			sharedVar.toEval.push(reqEval);
			res.status(200).end();
		});
})

//send the vote they get to the users who received a vote from the 'valutatore' app
player.get('/checkMark',(req,res)=>{
	//set all headers for server-sent
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Access-Control-Allow-Origin','*');
	res.flushHeaders();

	let userName = req.cookies.userId;
	if(userName)userName = userName.substring(0,5);
	else userName = 'undef';
	
	let interv = setInterval(()=>{
		let ind = sharedVar.evaluated.findIndex(x => x.id === userName);
		if(ind < 0) ;
		else{
			let tmp = sharedVar.evaluated.splice(ind,1);
			res.write('data:'+JSON.stringify(tmp)+'\n\n');
		}
	},5000);
	res.on('close',()=>{
		console.log("client dropped server sent for check mark");
		clearInterval(interv);
		res.end();
	})
})

//get the name if valutatore give me one
player.get('/getNewName',(req,res)=>{
	let id = req.cookies.userId;
	if(id)id = id.substring(0,5);
	else id = 'undef';

	if(sharedVar.listOfAssociatedNames.some(el => el[id])){
		let i = sharedVar.listOfAssociatedNames.findIndex(obj => Object.keys(obj)[0] === id);
		res.send(sharedVar.listOfAssociatedNames[i][id]);
	}
	else res.end();
})


//function to sort the array doing a ranking based on ratio between points gained and time spent
const bestPlayers = (a, b) => {
	if((a.points / a.time_minutes) >= (b.points / b.time_minutes))return a;
	return b;
};
//when the player has finished the story
player.post('/storyFinished',(req,res,next)=>{
	let id = req.cookies.userId;
	if(id)id = id.substring(0,5);
	else id = 'undef';

	let points = req.body.points;
	let name = req.body.assignedName;

	let now = new Date().getTime();
	let started = new Date(req.body.whenStarted).getTime();
	let timeSpent = (now - started) / 60000;
	timeSpent = timeSpent.toFixed(1);
	
	let currentPlayer = {id:id,assignedName:name,points:points,time_minutes:timeSpent};
	sharedVar.endPlayers.push(currentPlayer);
	//add player to the json
	fs.readFile('./valuta/results/'+ sharedVar.jsonResName, 'utf-8', function(err, data){
		if(err) {
			next(err);
			return;
		}

		let parsed = JSON.parse(data);
		parsed.users.push(currentPlayer);
		parsed.users.sort(bestPlayers);
		
		fs.writeFile('./valuta/results/'+sharedVar.jsonResName, JSON.stringify(parsed,null,2), 'utf-8', function (err) {
			if (err){
				next(err);
				return;
			}
			console.log('file classifica aggiornato correttamente');
		});
	});
	res.end();
})


//send the page when a user is disconnected 
player.get('/finishedPage',(req,res)=>{
	res.sendFile(path.join(__dirname,'../Player/endGame.html'));
})


/*
        CHAT SECTION
*/

//every time someone connect to the server
sharedVar.io.on('connection', (sock) => {
	//username is saved different for every socket
	let userName;

	if(!sharedVar.isStaff){
		if(sharedVar.cookies && sharedVar.cookies.userId) userName = sharedVar.cookies.userId;
		else{
			userName = 'user'+(sharedVar.idNum);
			sharedVar.idNum++;
		}
		//update the staff list
		sharedFunc.userJoin(userName);
	}
	else{
		if(sharedVar.cookies && sharedVar.cookies.staffId) userName = sharedVar.cookies.staffId;
		else{
			userName = 'staff'+ sharedVar.numStaff;
			sharedVar.numStaff++;
		}
	}

	//send the new user to the "valutatore"
	sharedVar.io.of('/staff').emit('update-users',userName);
	sharedVar.io.of('/staff').emit('current-story',sharedVar.story);
	
	//every user need to have a private chat with the staff so he will join a private room
	sock.join(userName);

	//catch the messages from the users and send them to the staff
	sock.on('chat-message',(text)=> sharedVar.io.of('/staff').emit('message',{mess:text,from:userName}));
	
	//when a user is disconnected the server tell the staff to delete him from the list
	sock.on('disconnect',() => {
		sharedFunc.removeUser(userName);
		sharedVar.partecipants.splice(sharedVar.partecipants.findIndex(x => x.who === userName),1);
		sharedVar.toEval.splice(sharedVar.toEval.findIndex(us => us.id === userName),1);
		
		sharedVar.io.of('/staff').emit('disc-user',userName);
		console.log(userName + ' is disconnected');
	}) 

});

module.exports = player;