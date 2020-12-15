const editor = require('express').Router();
const formidable = require('formidable');
const fs = require('fs-extra');
const path = require('path');


/* In questa maniera ogni errore non gestito viene gestito qui, brutto
process.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});*/

editor.get('/',(req,res) =>{
	res.status(200).sendFile(path.join(__dirname,"../Editor/index.html"));
})

/* save a new story */
editor.post('/saveStory', (req, res, next) => {
	var form = new formidable.IncomingForm();
	var jsonFile = {};
	var jsonTitle = req.query.title;
	var jsonOriginTitle = (req.query.originalTitle);
	console.log(jsonTitle,jsonOriginTitle);

	//if the originalTitle is empty the story doesn't exist
	if(jsonOriginTitle === ""){
		fs.mkdir( __dirname + '/stories/private/' + jsonTitle, (err) => { 
			if (err){
				next(err);
				return;
			} 
			console.log('Directory created successfully!'); 
		}); 
		fs.mkdir( __dirname + '/stories/private/' + jsonTitle +'/files', (err) => { 
			if (err){
				next(err);
				return;
			} 
			console.log('Directory \"files\" created successfully!'); 
		}); 
	}
	else if(jsonTitle !== jsonOriginTitle){
		fs.rename(__dirname + '/stories/private/' + jsonOriginTitle, __dirname + '/stories/private/' + jsonTitle, function(err) {
			if (err) {
			  next(err);
			  return;
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
			if(name === "firstActivity" || name === "missions" || name === "originalTitle" || name === "device" || name === "facilities" || name === "difficulties"){
				let tempObj = JSON.parse(field);
				jsonFile[name] = tempObj;
			}
			//because we catch the checkboxes but we have to process them inside the 'missions',not here
			else if(name === "isActive" || name === "facility" || name === "difficulty") ;
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
			next(err);
			return;
		})
		.on('end',() => {
			let json = JSON.stringify(jsonFile,null,2);

			//save the new json file	
			fs.writeFile('./stories/private/'+ jsonTitle +'/file.json', json, function (err) {
				if (err){
					next(err);
					return;
				} 
				console.log('Saved!');
			});
			res.status(200).end();
		});
});


/* require a story which already exists */ 
editor.get('/getStory',(req, res,next) => {
	fs.readFile('./stories/'+req.query.group+'/'+req.query.title+'/file.json', 'utf8', (err, data) => {  
		
		if(err){
			next(err);
			return;
		}
		res.set('Content-Type', 'application/json');
		res.status(200).send(data)
	})
})


/* require widgets names */
editor.get('/getWidgets',(req, res, next) => {
	let names = { widgets: [], devices: []};
	fs.readdir('./widgets', (err, files) => {
		if (err){
			next(err);
			return;
		} 
		else {
			//no directories here but control is necessary
			files.map(function(f) {
				names.widgets.push(f);
			});
			fs.readdir('./devices', (err, files) => {
				if (err){
					next(err);
					return;
				} 
				else {
					//no directories here but control is necessary
					files.map(function(f) {
						names.devices.push(f);
					});
					
					res.status(200).json(names);
				}	
			});
		}	
	});
})

/* create a new directory widget */
editor.post('/saveWidget', (req, res, next) => {
	var widgetName = req.query.name;
	let dirName =  __dirname + '/widgets/' + widgetName;
	fs.mkdir(dirName, (err) => { 
		if (err){
			next(err);
			return;
		} 
		console.log('Widget directory created successfully!'); 
	}); 
	var form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', function (name, file){
			if(file.name != "") file.path = dirName + '/'+ widgetName + file.name.substring(file.name.lastIndexOf('.'));
		})
		.on('error', (err) => {
			console.error('Error', err);
			next(err);
			return;
		})
		.on('end',() => {			
			res.status(200).end();
		});
})

/* CODICE TITLES */
var obj = { private: [], public: []} ;

function readDir(path) {
	return new Promise( (succ, rej) => {
		fs.readdir(path, (err, files) => {
			if (err) rej(err);
			else succ(files);
		})
	}).catch((err)=>{console.log(err);})
}



function readFiles(dir, f) {
	return new Promise((succ, rej) => {
		fs.readFile(dir + '/'+ f + '/file.json', 'utf8', (err, data) => {  
			if (err) rej(err);
			else {
				let file = JSON.parse(data);
				let missions = [];
				file.missions.map( x => {
					missions.push(x.name);
				})
				
				// '\\' must change in linux to '/'
				dirName = dir.substring(dir.lastIndexOf('\\') + 1);
				obj[`${dirName}`].push({title:f,missionsList:missions, accessibility: file.accessibility});
				succ(data);
			}
		})		
	}).catch((err)=>{console.log(err);})
}

async function addFiles(dir1, dir2,res) {
	const files1 = await readDir(dir1);
	await Promise.all(files1.map(async (f) => {
		await readFiles(dir1, f);
	}))
	const files2 = await readDir(dir2);
	await Promise.all(files2.map(async (f) => {
		await readFiles(dir2, f);
	}))
	
	res.json(obj);
	obj.private = [];
	obj.public = [];
}

/* return the list of titles and the missions of the stories stored in the server */
editor.get('/titles',(req, res) => {
	const private = path.join(__dirname,'/stories/private');
	const public = path.join(__dirname,'/stories/public');
	addFiles(private, public, res);
	
})

/*************************** FINE  */

/* copy an activity i received to a story */
editor.post('/copyActivity',(req,res,next) => {
	let toStory = req.query.toStory;
	let toMiss = req.query.toMiss;
	let path = './stories/private';
	let activity = req.body;	

	fs.readFile(path + '/'+toStory + '/file.json', 'utf8', (err, data) => {  
		if (err){
			next(err);
			return;
		} 
		let story = JSON.parse(data);
		//set the new activity number to the last old activity +1
		activity.number = (story.missions[toMiss].activities.length != 0)?story.missions[toMiss].activities.length : 0;
		story.missions[toMiss].activities.push(activity);
		fs.writeFile(path + '/'+toStory + '/file.json', JSON.stringify(story,null,2), function (err) {
			if (err){
				next(err);
				return;
			} 
			console.log('Added a new activity to '+ toStory);
			res.status(200).end();
		});
	})
		
})

/* copy a mission to a story*/
editor.post('/copyMission',(req,res,next) => {
	let toStory = req.query.toStory;
	let path = './stories/private';
	let mission = req.body;	

	fs.readFile(path + '/'+toStory + '/file.json', 'utf8', (err, data) => {  
		if (err){
			next(err);
			return;
		} 
		let story = JSON.parse(data);
		//set the new mission number to the last mission +1
		mission.name = "Missione " + ((story.missions.length != 0)?story.missions.length+1 : 1);
		story.missions.push(mission);
		fs.writeFile(path + '/'+toStory + '/file.json', JSON.stringify(story,null,2), function (err) {
			if (err){
				next(err);
				return;
			} 
			console.log('Added a new activity to '+ toStory);
			res.status(200).end();
		});
	})
		
})

/* delete a story */
editor.delete('/deleteStory', (req, res,next) => {
	let where = req.query.group;
	let dir = './stories/'+where+'/'+ req.query.title ;
	console.log(dir);
	fs.rmdir(dir, { recursive: true }, (err) => {
		if (err) {
			next(err);
			return;
		}
	
		console.log(`${dir} is deleted!`);
	})
	res.status(200).end();
})

/* duplicate a story */
editor.put('/copyStory/:title', (req, res,next) => {
	let dir = './stories/private/'+ req.params.title ;
	var names = [] ;

	fs.readdir('./stories/private/', (err, files) => {
		if (err){
			next(err);
			return;
		} 
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
				if (err){
					next(err);
					return;
				} 
				console.log('success!');
				fs.readFile(copy + '/file.json', 'utf8', (err, data) => {  
					if (err){
						next(err);
						return;
					} 
					let story = JSON.parse(data);
					story.title = title;
					story.originalTitle = title;
					fs.writeFile(copy + '/file.json', JSON.stringify(story,null,2), function (err) {
						if (err){
							next(err);
							return;
						} 
						console.log('Saved!');
					});
				})
			});
			
			res.status(200).send({title: title});
		}	
	});

})

/* make a story public */
editor.put('/publicStory/:title', (req, res,next) => {
	let dir = './stories/private/'+ req.params.title ;
	let toDir = './stories/public/'+ req.params.title;
	fs.rename(dir, toDir, err => {
		if (err) {
		  next(err);
		  return;
		}
	});
	res.status(200).send({title: req.params.title});

});

/* make a story private */
editor.put('/privateStory/:title', (req, res,next) => {
	let dir = './stories/public/'+req.params.title;
	let toDir = './stories/private/'+ req.params.title;
	fs.rename(dir, toDir, err => {
		if (err) {
		  next(err);
		  return;
		}
	});
	res.status(200).send({title: req.params.title});
});





module.exports = editor;