
const express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const path = require('path');
var http = require('http');

const app = express();
const server = http.createServer(app);
let shareObj = require('./funcAndVar');
let socketio = require('./funcAndVar').socketio;

shareObj.sharedVariables.io = socketio().listen(server,{cookie:false});

var editor = require('./editor-module');
var player = require('./player-module');
var valutatore = require('./valutatore-module');

app.use(express.static(`${__dirname}/..`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/Editor',editor);
app.use('/Play',player);
app.use('/Valutatore',valutatore);

/*
POSSIBILE USO DI UN MIDDLEWARE CREATO DA NOI
app.use((error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;
 
  if (error.statusCode === 301) {
    return res.status(301).redirect('/not-found');
  }
 
  return res
    .status(error.statusCode)
    .json({ error: error.toString() });
});*/

server.on('error', (err) => {
  console.error(err);
});

server.listen(8000, () => {
  console.log('server is listening on 8000');
});



 

 
