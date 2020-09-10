const express = require('express');
const path = require('path');
const body_pars = require('body-parser');
const fs = require('fs');

const app = express();

//to manage the request body
var urlEncodedPars = body_pars.urlencoded({ extended: false });

app.use(express.static(path.join(__dirname,'..')));

app.get("/", (req,res) => {
	res.status(200);
	res.sendFile(path.join(__dirname,"..","index.html"));
});

app.post("/stories", urlEncodedPars, (req,res) => {

	//TODO:ciclare su questi dati per creare un file json della storia e salvarlo server side

	for (var [key, value] of Object.entries(req.body)) {
		//printing the data i receive from the form
		console.log(key, value);
	}
	//coming back before the submit action
	res.redirect('back');
});


app.listen(8080, () => {
  console.log('server is ready');
});