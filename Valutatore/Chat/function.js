const usersList = [];

//function for managing users

function userJoin(id){
    const user = {id};
    usersList.push(user);
    return user;
}

function getCurrenUser(id){
    return usersList.find(user => user.id === id);
}

function removeUser(id){
    let i=0;
    while(i < usersList.length){
        if(usersList[i].id === id){
            usersList.splice(i,1);
            break;
        }
        i++;
    }
}

module.exports = {
    userJoin,
    getCurrenUser,
    removeUser,
    usersList
}