const socketio = require('socket.io');

let sharedVariables = {
    usersList:[],
    story:null,
    device:null,
    oldStory:null,
    cookies:null,
    cookieNum : 1,
    numStaff : 1,
    isStaff : false,
    idNum : 1,
    io: null,
    //@partecipants: all the users connected(to keep trace of update position),@askingHelp:array for users who ask help with the button
    partecipants :[],
    askingHelp : [],
    //list of object {id-name assigned}
    listOfAssociatedNames : [],
    //players who finished the game,list of obj {name:,points:}
    endPlayers : [],
    toEval : [],
    evaluated : [],
    firstRequest: true,
    jsonResName: null
}

//functions for managing list of users for updating staff on first connection
function userJoin(id){
    if(id){
        if(sharedVariables.usersList.includes(id));
        else sharedVariables.usersList.push(id);
        return id;
    }
    return "undefined";
}

function getCurrenUser(id){
    if(id)return sharedVariables.usersList.find(user => user === id);
}

function removeUser(id){
    if(id){
        let index= sharedVariables.usersList.indexOf(id);
        if(index != -1) sharedVariables.usersList.splice(index,1);
    }
}


//to reinitialize all the variables when the game is over
function reinitializeVariables(){
	//cookie management variables
	sharedVariables.cookieNum = 1;
	sharedVariables.numStaff = 1;
	sharedVariables.isStaff = false;
	sharedVariables.idNum = 1;
	//'valutatore' variables
	sharedVariables.partecipants = [];
	sharedVariables.askingHelp = [];
	sharedVariables.listOfAssociatedNames = [];
	sharedVariables.endPlayers = [];
	sharedVariables.toEval = [];
    sharedVariables.evaluated = [];
    sharedVariables.firstRequest = true;
	//emit event to disconnect all users and to refresh 'valutatore' page
	sharedVariables.io.of('/').emit('force-disconnect','now');
    sharedVariables.io.of('/staff').emit('refresh-page','now');
}


let sharedFunctions = {
    userJoin : userJoin,
    getCurrenUser: getCurrenUser,
    removeUser: removeUser,
    reinitializeVariables: reinitializeVariables
}


module.exports = {
    sharedVariables,
    sharedFunctions,
    socketio 
}