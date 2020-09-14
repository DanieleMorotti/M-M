import Routes from './routes.js'


var request = new XMLHttpRequest();

request.open('GET', 'http://localhost:8080/stories', true);

request.onload = function(data) {
    localStorage.setItem("story", request.responseText);
    Routes[0].component.methods.render();
    Routes[1].component.methods.render();
};

request.send(null);

const router = new VueRouter({
  routes: Routes,
})

//function that is executed before every routing change
router.beforeEach((to, from, next) => {
  if(to.path === '/device') {
    document.getElementById('stylesheetComp').href = 'device.css';
    document.getElementById('scriptComp').src = './js/device.js';
  } 
  else if(to.path === '/door') {
    document.getElementById('stylesheetComp').href ='./widgets/door.css';
    document.getElementById('scriptComp').src = './widgets/door.js';
  }
  else if(to.path === '/lock') {
    document.getElementById('stylesheetComp').href ='./widgets/lock.css';
    document.getElementById('scriptComp').src = './widgets/lock.js';
  }
  else {
    document.getElementById('stylesheetComp').href ='home.css';  
    document.getElementById('scriptComp').src = './js/home.js';
  }

  next();
})


new Vue({
    router: router,
    el: '#app',
  
})
