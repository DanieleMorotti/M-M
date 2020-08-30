import Routes from './routes.js'

var request = new XMLHttpRequest();

request.open('GET', './data.json');

request.onload = function() {
    localStorage.setItem("story", request.responseText);
    Routes[0].component.methods.render();
    Routes[1].component.methods.render();
};

request.send();


/*
$.ajax({
    url: './data.json',
    success: function(data) {
      $('.result').html(data);
      alert('Caricamento effettuato');
    },
    error: function(data) {
      alert('Caricamento impossibile');
    }
})
*/
const router = new VueRouter({
  routes: Routes,
})


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
