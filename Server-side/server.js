
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
//const { readdir } = require('fs');

const app = express();

app.use(express.static(`${__dirname}/..`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/Editor',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"../Editor/index.html"));
})

/* save a new story */
app.post('/saveStory', (req, res) => {
	var form = new formidable.IncomingForm();
	var jsonFile = {};
	var jsonTitle = req.query.title;
	var jsonOriginTitle = (req.query.originalTitle);
	console.log(jsonTitle,jsonOriginTitle);

	//if the originalTitle is empty the story doesn't exist
	if(jsonOriginTitle === ""){
		fs.mkdir( __dirname + '/stories/private/' + jsonTitle, (err) => { 
			if (err) throw err;
			console.log('Directory created successfully!'); 
		}); 
		fs.mkdir( __dirname + '/stories/private/' + jsonTitle +'/files', (err) => { 
			if (err) console.log(err);
			console.log('Directory \"files\" created successfully!'); 
		}); 
	}
	else if(jsonTitle !== jsonOriginTitle){
		fs.rename(__dirname + '/stories/private/' + jsonOriginTitle, __dirname + '/stories/private/' + jsonTitle, function(err) {
			if (err) {
			  console.log(err);
			} else {
			  console.log("Successfully renamed the directory.");
			}
		});
	}
	else{
		console.log("non creo cartella");
	}

	form.parse(req);
	form.on('field', (name, field) => {
			//because activities field is already a json,so i need to convert it to a js object to push into jsonfile
			if(name === "missions" || name === "originalTitle" || name === "device"){
				let tempObj = JSON.parse(field);
				jsonFile[name] = tempObj;
			}
			//because we catch the checkboxes but we have to process them inside the 'missions',not here
			else if(name === "isActive") ;
			else{
				if(name === "title")
					jsonTitle = field;
				jsonFile[name] = field;
			}
		})
		.on('fileBegin', function (name, file){
			if(file.name != "") file.path = __dirname + '/stories/private/'+ jsonTitle +'/files/' + file.name;
		})
		.on('file', (name, file) => {
			jsonFile[name] = file.name;
		})
		.on('error', (err) => {
			console.error('Error', err);
			throw err;
		})
		.on('end',() => {
			let json = JSON.stringify(jsonFile,null,2);

			//save the new json file	
			fs.writeFile('./stories/private/'+ jsonTitle +'/file.json', json, function (err) {
				if (err) throw err;
				console.log('Saved!');
			});
			res.status(200).end();
		});
});


var story, device;
/* require a story which already exists */ 
app.get('/getStory',(req, res) => {
	story = req.query.title;
	fs.readFile('./stories/'+req.query.group+'/'+req.query.title+'/file.json', 'utf8', (err, data) => {  
		device = JSON.parse(data).device;
		console.log('caricamento storia' +device);
		res.set('Content-Type', 'application/json');
		res.send(data)
		res.status(200);
	})
})

/* require device's css */
app.get('/getDeviceCss',(req, res) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	res.sendFile(path.join(__dirname,".",'./devices/'+req.query.name+'/device.css'));
})
app.get('/getDeviceJs',(req, res) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	res.sendFile(path.join(__dirname,".",'./devices/'+req.query.name+'/device.js'));
})

/* require widgets names */
app.get('/getWidgets',(req, res) => {
	let names = { widgets: [], devices: []};
	fs.readdir('./widgets', (err, files) => {
		if(err) throw err;
		else {
			// add control to verify if file is a directory !!!
			files.map(function(f) {
				names.widgets.push(f);
			});
			fs.readdir('./devices', (err, files) => {
				if(err) throw err;
				else {
					// add control to verify if file is a directory !!!
					files.map(function(f) {
						names.devices.push(f);
					});
					
					res.status(200);
					res.json(names);
				}	
			});
		}	
	});
})

/* create a new directory widget */
app.post('/saveWidget', (req, res) => {
	var widgetName = req.query.name;
	let dirName =  __dirname + '/widgets/' + widgetName;
	fs.mkdir(dirName, (err) => { 
		if (err) throw err;
		console.log('Directory created successfully!'); 
	}); 
	var form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', function (name, file){
			if(file.name != "") file.path = dirName + '/'+ widgetName + file.name.substring(file.name.lastIndexOf('.'));
		})
		.on('error', (err) => {
			console.error('Error', err);
			throw err;
		})
		.on('end',() => {			
			res.status(200).end();
		});
})

/* CODICE TITLES */
var obj = { private: [], public: []} ;

function readDir(path) {
	return new Promise( (succ, err) => {
		fs.readdir(path, (err, files) => {
			if(err) throw err;
				succ(files);
		})
	})
}



function readFiles(dir, f) {
	return new Promise((succ, err) => {
		fs.readFile(dir + '/'+ f + '/file.json', 'utf8', (err, data) => {  
			if (err) throw err;
			else {
				let file = JSON.parse(data);
				let missions = [];
				file.missions.map( x => {
					missions.push(x.name);
				})
				// fare attenzione qui!!
				dirName = dir.substring(dir.lastIndexOf('\\') + 1);
				obj[`${dirName}`].push({title:f,missionsList:missions});
				succ(data);
			}
		})
	})
}

async function addFiles(dir1, dir2,res) {
	const files1 = await readDir(dir1);
	await Promise.all(files1.map(async (f) => {
		if(f!=='new story')
			await readFiles(dir1, f);
	}))
	const files2 = await readDir(dir2);
	await Promise.all(files2.map(async (f) => {
		if(f!=='new story')
		await readFiles(dir2, f);
	}))
	res.json(obj);
	obj.private = [];
	obj.public = [];
}

/* return the list of titles and the missions of the stories stored in the server */
app.get('/titles',(req, res) => {
	const private = path.join(__dirname,'/stories/private');
	const public = path.join(__dirname,'/stories/public');
	addFiles(private, public, res);
	
})

/*************************** FINE  */

/* copy an activity i received to a story */
app.post('/copyActivity',(req,res) => {
	let toStory = req.query.toStory;
	let toMiss = req.query.toMiss;
	let path = './stories/private';
	let activity = req.body;	

	fs.readFile(path + '/'+toStory + '/file.json', 'utf8', (err, data) => {  
		if (err) throw err;
		let story = JSON.parse(data);
		//set the new activity number to the last old activity +1
		activity.number = (story.missions[toMiss].activities.length != 0)?story.missions[toMiss].activities.length : 0;
		story.missions[toMiss].activities.push(activity);
		fs.writeFile(path + '/'+toStory + '/file.json', JSON.stringify(story,null,2), function (err) {
			if (err) throw err;
			console.log('Added a new activity to '+ toStory);
			res.status(200).end();
		});
	})
		
})

/* copy a mission to a story*/
app.post('/copyMission',(req,res) => {
	let toStory = req.query.toStory;
	let path = './stories/private';
	let mission = req.body;	

	fs.readFile(path + '/'+toStory + '/file.json', 'utf8', (err, data) => {  
		if (err) throw err;
		let story = JSON.parse(data);
		//set the new mission number to the last mission +1
		mission.name = "Missione " + ((story.missions.length != 0)?story.missions.length+1 : 1);
		story.missions.push(mission);
		fs.writeFile(path + '/'+toStory + '/file.json', JSON.stringify(story,null,2), function (err) {
			if (err) throw err;
			console.log('Added a new activity to '+ toStory);
			res.status(200).end();
		});
	})
		
})

/* delete a story */
app.delete('/deleteStory', (req, res) => {
	let where = req.query.group;
	let dir = './stories/'+where+'/'+ req.query.title ;
	console.log(dir);
	fs.rmdir(dir, { recursive: true }, (err) => {
		if (err) {
			throw err;
		}
	
		console.log(`${dir} is deleted!`);
	})
	res.status(200).end();
})

/* duplicate a story */
app.put('/copyStory/:title', (req, res) => {
	let dir = './stories/private/'+ req.params.title ;
	var names = [] ;

	fs.readdir('./stories/private/', (err, files) => {
		if(err) throw err;
		else {
			// add control to verify if file is a directory !!!
			files.map(function(f) {
				names.push(f);
			});

			let copy = dir + ' - copy';
			let title = copy.substring(copy.lastIndexOf('/') + 1);
			let i = 0;
			names.find((element) => {
				if(element.substr(0, title.length) === title) i++;
			});
			if(i > 0) {
				copy += '('+(i)+')';
				title += '('+(i)+')';
			}
			fs.copy(dir, copy , err =>{
				if(err) return console.error(err);
				console.log('success!');
				fs.readFile(copy + '/file.json', 'utf8', (err, data) => {  
					if (err) throw err;
					let story = JSON.parse(data);
					story.title = title;
					story.originalTitle = title;
					fs.writeFile(copy + '/file.json', JSON.stringify(story,null,2), function (err) {
						if (err) throw err;
						console.log('Saved!');
					});
				})
			});
			
			res.send({title: title});
			res.status(200);
		}	
	});

})

/* make a story public */
app.put('/publicStory/:title', (req, res) => {
	let dir = './stories/private/'+ req.params.title ;
	let toDir = './stories/public/'+ req.params.title;
	fs.rename(dir, toDir, err => {
		if (err) {
		  throw err;
		}
	});
	res.status(200);
	res.send({title: req.params.title});

});

/* make a story private */
app.put('/privateStory/:title', (req, res) => {
	let dir = './stories/public/'+req.params.title;
	let toDir = './stories/private/'+ req.params.title;
	fs.rename(dir, toDir, err => {
		if (err) {
		  throw err;
		}
	});
	res.status(200);
	res.send({title: req.params.title});
});


/*****************
 * GESTIONE PLAYER
 *****************/

app.get('/Player',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"../Player/index.html"));
})

app.get('/getImage',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"/stories/public/"+ req.query.title +"/files/"+req.query.name));
})

app.get('/getDeviceJs',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"/devices/"+req.query.name+"/device.js"));
})

app.get('/getDeviceCss',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"/devices/"+req.query.name+"/device.css"));
})


/*****************************/

app.listen(8080, () => {
  console.log('server is ready');
});



 

 
