
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');

const app = express();

app.use(express.static(`${__dirname}/..`));
const nocache = require('nocache');


app.use(nocache());

app.post('/story', (req, res) => {

	var form = new formidable.IncomingForm();
	var jsonFile = {};

	form.parse(req);
	form.on('field', (name, field) => {
			//because activities field is already a json,so i need to convert it to a js object to push into jsonfile
			if(name === "activities"){
				let tempObj = JSON.parse(field);
				jsonFile[name] = tempObj;
			}else{
				jsonFile[name] = field;
			}
		})
		.on('fileBegin', function (name, file){
			if(file.name != "")file.path = __dirname + '/stories/files/' + file.name;
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

			if(JSON.parse(jsonFile['originalTitle'])) {
				fs.unlink('./stories/'+ JSON.parse(jsonFile['originalTitle']) +'.json', function (err) {
					if (err) throw err;
					console.log('deleted');
				});
			}

			fs.writeFile('./stories/'+ jsonFile['title'] +'.json', json, function (err) {
				if (err) throw err;
				console.log('Saved! ' + json);
			});
			res.status(200).end();
		});
});



app.get('/',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"..","index.html"));
})

// when someone ask for a story 
app.get('/stories',(req, res) => {
	//res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	fs.readFile('./stories/'+req.query.story+'.json', 'utf8', (err, data) => {  
	 
		res.set('Content-Type', 'application/json');
	//	console.log('requested: ' + data);
		res.send(data)
		res.status(200);
	  })
})

//return the list of titles of the stories stored in the server
app.get('/titles',(req, res) => {
	//res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	const dir = './stories';
	var names = [] ;

	fs.readdir(dir, (err, files) => {
		if(err) {
			console.log(err);
		}
		else {
			files.forEach(file => {
				if (path.extname(file) == ".json") names.push(file.slice(0, -5));
			});
			res.status(200);
			res.json(names);
		}	
	});
	
})


app.delete('/story/:title', (req, res) => {
	fs.unlink('./stories/'+ req.params.title +'.json', function (err) {
		if (err) throw err;
		console.log('Deleted');
		res.status(200).end();
	});
})

app.listen(8080, () => {
  console.log('server is ready');
});



 

 
