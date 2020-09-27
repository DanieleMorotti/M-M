import Routes from './routes.js'
//request.open('GET', '../data.json', true);

let story = JSON.parse(localStorage.getItem("story"));

const router = new VueRouter({
  routes: Routes,
})

console.log(Routes);
//function that is executed before every routing change
router.beforeEach((to, from, next) => {
  if(to.path === '/device') {
    document.getElementById('stylesheetComp').href = `/getDeviceCss?name=${story.device}`;
    document.getElementById('scriptComp').src = `/getDeviceJs?name=${story.device}`;
    $('body').append("<script src='./js/activities.js'><\/script>")
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
    document.getElementById('stylesheetComp').href ='/home.css';  
    document.getElementById('scriptComp').src = './js/home.js';
  }

  next();
})


new Vue({
    router: router,
    el: '#app',
  
})
