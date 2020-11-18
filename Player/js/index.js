import Routes from './routes.js'

export const bus = new Vue();

let story = JSON.parse(localStorage.getItem("story"));

const router = new VueRouter({
  routes: Routes,
})


//function that is executed before every routing change
router.beforeEach((to, from, next) => {
  if(to.path === '/device') {
    document.getElementById('stylesheetComp').href = `../../Server-side/devices/${story.device}/device.css`;
    document.getElementById('scriptComp').src = `../../Server-side/devices/${story.device}/device.js`;
  } 
  else {
    document.getElementById('stylesheetComp').href ='/Player/home.css';  
    document.getElementById('scriptComp').src = './js/home.js';
  }

  next();
})


new Vue({
    router: router,
    el: '#app'
})

