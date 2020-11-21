
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


server.on('error', (err) => {
  console.error(err);
});

server.listen(8000, () => {
  console.log('server is listening on 8000');
});



 

 
