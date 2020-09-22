
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs-extra');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static(`${__dirname}/..`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"..","index.html"));
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
			if(name === "activities" || name === "originalTitle"){
				let tempObj = JSON.parse(field);
				jsonFile[name] = tempObj;
			}
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


/* require a story which already exists */ 
app.get('/getStory',(req, res) => {
	fs.readFile('./stories/'+req.query.group+'/'+req.query.title+'/file.json', 'utf8', (err, data) => {  
		res.set('Content-Type', 'application/json');
		//console.log('requested: ' + data);
		res.send(data)
		res.status(200);
	})
})

/* require widgets names */
app.get('/getWidgets',(req, res) => {
	let names = [];
	fs.readdir('./widgets', (err, files) => {
		if(err) throw err;
		else {
			// add control to verify if file is a directory !!!
			files.map(function(f) {
				names.push(f);
			});
			res.status(200);
			res.json(names);
		}	
	});
})


/* return the list of titles of the stories stored in the server */
app.get('/titles',(req, res) => {
	const private = './stories/private';
	const public = './stories/public';
	var obj = { private: [], public: []} ;

	fs.readdir(private, (err, files) => {
		if(err) throw err;
		else {
			// add control to verify if file is a directory !!!
			files.map(function(f) {
				obj.private.push(f);
			});
			fs.readdir(public, (err, files) => {
				if(err) throw err;
				else {
					// add control to verify if file is a directory !!!
					files.map(function(f) {
						obj.public.push(f);
					});
					res.status(200);
					res.json(obj);
				}	
			});
		}	
	});
	
})

app.get('/publicTitles',(req, res) => {
	const dir = './stories/public';
	var names = [] ;

	fs.readdir(dir, (err, files) => {
		if(err) {
			console.log(err);
		}
		else {
			// add control to verify if file is a directory !!!
			files.map(function(f) {
				names.push(f);
			});
			res.status(200);
			res.json(names);
		}	
	});
	
})

/*copy an activity i received to a story*/
app.post('/copyActivity',(req,res) => {
	let toStory = req.query.toStory;
	let path = './stories/private';
	let find = false;
	let activity = req.body;
	console.log(JSON.stringify(activity,null,2));
	//get the directory of the story(public or private)
	fs.readdir(path, (err, files) => {
		if(err)console.log(err);
		else {
			files.map((f) => {
				if(toStory === f){
					find = true;
				}
			});
		}	
	});
	
	fs.readFile(path + '/'+toStory + '/file.json', 'utf8', (err, data) => {  
		if (err) throw err;
		let story = JSON.parse(data);
		//set the new activity number to the last old activity +1
		activity.number = (story.activities.length != 0)?story.activities[story.activities.length - 1].number +1:1;
		story.activities.push(activity);
		fs.writeFile(path + '/'+toStory + '/file.json', JSON.stringify(story,null,2), function (err) {
			if (err) throw err;
			console.log('Added a new activity to '+ toStory);
		});
	})
	res.status(200).end();
	
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

app.listen(8080, () => {
  console.log('server is ready');
});



 

 
