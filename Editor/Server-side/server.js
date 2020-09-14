
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/story', function(req, res) {
	res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	console.log(req.body);

	fs.writeFile('./Server-side/stories/'+req.body.title+'.json', JSON.stringify(req.body, null, 2), function (err) {
		if (err) throw err;
		console.log('Saved!');
	});

});


const data = require('./stories/storia1.json');

// when someone ask for a story 
app.get('/stories',(req, res) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	res.json( data);
})

app.get('/titles',(req, res) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:5000");
	const dir = './Server-side/stories';
	var names = [] ;

	fs.readdir(dir, (err, files) => {
        files.forEach(file => {
			names.push(file.slice(0, -5));
		});
		console.log(names);
		res.json(names);
	});
	
})

app.listen(8080, () => {
  console.log('server is ready');
});



 
