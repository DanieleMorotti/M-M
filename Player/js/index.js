import Routes from './routes.js'

/*
var request = new XMLHttpRequest();

request.open('GET', 'http://localhost:8080/getStory?title="cappuccetto rosso"&group="public"', true);

request.onload = function(data) {
    localStorage.setItem("story", request.responseText);
    Routes[0].component.methods.render();
    Routes[1].component.methods.render(); 
    console.log('here');
    console.log(data);
};

request.send(null); */

$.ajax({
  type: "GET",
  dataType: "json",
  cache: false,
  url: '/getStory?title=cappuccetto rosso&group=private',
  success: (data) =>{
   // fill form with json's fields
      console.log(data);
      localStorage.setItem("story", JSON.stringify(data));
      Routes[0].component.methods.render();
  },
  error: function (e) {
      console.log("error in get story",e);
  }
});


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
