const usersList = [];

//functions for managing users

function userJoin(id){
    if(usersList.includes(id));
    else usersList.push(id);
    return id;
}

function getCurrenUser(id){
    return usersList.find(user => user === id);
}

function removeUser(id){
    let index= usersList.indexOf(id);
    if(index != -1) usersList.splice(index,1);
}

module.exports = {
    userJoin,
    getCurrenUser,
    removeUser,
    usersList
}