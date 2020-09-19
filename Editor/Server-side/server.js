
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');

const app = express();

app.use(express.static(`${__dirname}/..`));

app.get('/',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"..","index.html"));
})

/* save a new story */
app.post('/saveStory', (req, res) => {
	var form = new formidable.IncomingForm();
	var jsonFile = {};
	var jsonTitle;

	form.parse(req);
	form.on('field', (name, field) => {
			//because activities field is already a json,so i need to convert it to a js object to push into jsonfile
			if(name === "activities" || name === "originalTitle"){
				let tempObj = JSON.parse(field);
				jsonFile[name] = tempObj;
				if(name === "originalTitle") {
					console.log(tempObj);
					if(!tempObj) {
						console.log(jsonTitle);
						fs.mkdir( __dirname + '/stories/public/' + jsonTitle, (err) => { 
							if (err) throw err;
							console.log('Directory created successfully!'); 
						}); 
						fs.mkdir( __dirname + '/stories/public/' + jsonTitle +'/files', (err) => { 
							if (err) console.log(err);
							console.log('Directory created successfully!'); 
						}); 
					}
					else if(!tempObj && tempObj != jsonTitle) { 
						/* if title is changed rename directory */
						fs.rename(__dirname + '/stories/public/' + tempObj, __dirname + '/stories/public/' + jsonTitle, function(err) {
							if (err) {
							  console.log(err)
							} else {
							  console.log("Successfully renamed the directory.")
							}
						}) 
					}
					
				}
			}
			else{
				if(name === "title")
					jsonTitle = field;
				jsonFile[name] = field;
			}
		})
		.on('fileBegin', function (name, file){
			if(file.name != "") file.path = __dirname + '/stories/public/'+ jsonTitle +'/files/' + file.name;
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
			let original = jsonFile['originalTitle'];

			/*
			//delete the old file if the title is changed
			if(original && original != jsonFile['title']) {
				fs.unlink('./stories/public/'+ jsonFile['originalTitle'] +'.json', function (err) {
					if (err) throw err;
					console.log('deleted');
				});
			}
			*/

			//save the new json file	
			fs.writeFile('./stories/public/'+ jsonTitle +'/file.json', json, function (err) {
				if (err) throw err;
				console.log('Saved!');
			});
			res.status(200).end();
		});
});


/* require a story which already exists */ 
app.get('/stories',(req, res) => {
	fs.readFile('./stories/public/'+req.query.story+'/file.json', 'utf8', (err, data) => {  
		res.set('Content-Type', 'application/json');
		//console.log('requested: ' + data);
		res.send(data)
		res.status(200);
	})
})

/* return the list of titles of the stories stored in the server */
app.get('/titles',(req, res) => {
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
			/*
			files.forEach(file => {
				//if (path.extname(file) == ".json") names.push(file.slice(0, -5));
			}); */
			res.status(200);
			res.json(names);
		}	
	});
	
})

/* delete a story */
app.delete('/deleteStory/:title', (req, res) => {
	let dir = './stories/public/'+ req.params.title ;
	console.log(dir);
	fs.rmdir(dir, { recursive: true }, (err) => {
		if (err) {
			throw err;
		}
	
		console.log(`${dir} is deleted!`);
	})
	/*fs.unlink('./stories/public/'+ req.params.title +'.json', function (err) {
		if (err) throw err;
		console.log('Deleted');
		res.status(200).end();
	});*/
	res.status(200).end();
})

/* duplicate a story 
app.put('/copyStory/:title', (req, res) => {
	
	fs.readFile('./stories/public/'+req.params.title+'.json', 'utf8', (err, data) => {  
		res.set('Content-Type', 'application/json');
		console.log('copy' +data);
		let story = JSON.parse(data);
		story.title = story.title + ' - copy';
		story.originalTitle = story.title;
		let json = JSON.stringify(story,null,2);

		fs.writeFile('./stories/public/'+ story.title +'.json', json, (err) => {
			if (err) throw err;
			console.log('Saved!');
			res.send({title: story.title});
			res.status(200);
		});

	})

})*/

/* public a story */
app.put('/publicStory/:title', (req, res) => {
	fs.readFile('./stories/public/'+req.params.title+'.json', 'utf8', (err, data) => {  
		res.set('Content-Type', 'application/json');
		let story = JSON.parse(data);
		let json = JSON.stringify(story,null,2);

		fs.writeFile('./stories/private/'+ story.title +'.json', json, (err) => {
			if (err) throw err;
			res.send({title: story.title});
			res.status(200);
		});

	})
})

app.listen(8080, () => {
  console.log('server is ready');
});



 

 
