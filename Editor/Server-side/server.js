
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs-extra');

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
app.get('/stories',(req, res) => {
	fs.readFile('./stories/private/'+req.query.story+'/file.json', 'utf8', (err, data) => {  
		res.set('Content-Type', 'application/json');
		//console.log('requested: ' + data);
		res.send(data)
		res.status(200);
	})
})

/* return the list of titles of the stories stored in the server */
app.get('/titles',(req, res) => {
	const dir = './stories/private';
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
	let copy = dir + ' - copy';
	fs.copy(dir, copy , err =>{
		if(err) return console.error(err);
		console.log('success!');
		res.send({title:  req.params.title+' - copy'});
		res.status(200);
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



 

 
