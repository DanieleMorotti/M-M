
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');

const app = express();

app.use(express.static(`${__dirname}/..`));

app.post('/story', (req, res) => {
	//res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	/*console.log(req.body);
	if(req.body.title){
		/*fs.writeFile('./stories/'+req.body.title+'.json', JSON.stringify(req.body, null, 2), function (err) {
			if (err) throw err;
			console.log('Saved!');
		});
	}
	res.status(200).end();*/
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
		.on('end',()=>{
			let json = JSON.stringify(jsonFile,null,2);

			fs.writeFile('./stories/'+ jsonFile['title'] +'.json', json, function (err) {
				if (err) throw err;
				console.log('Saved!');
			});
			res.status(200).end();
		});
});


const data = require('./stories/storia1.json');

app.get('/',(req,res) =>{
	res.status(200);
	res.sendFile(path.join(__dirname,"..","index.html"));
})

// when someone ask for a story 
app.get('/stories',(req, res) => {
	//res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	res.status(200);
	res.json( data);
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
			console.log(names);
			res.status(200);
			res.json(names);
		}	
	});
	
})

app.listen(8080, () => {
  console.log('server is ready');
});



 

 
