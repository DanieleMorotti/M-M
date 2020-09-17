import Routes from './routes.js'

export const bus = new Vue();

const router = new VueRouter({
  routes: Routes,
})

//function that is executed before every routing change
router.beforeEach((to, from, next) => {
  if(to.path === '/editMenu') {
    $('#stylesheetComp').attr('href','./edit.css');
    //document.getElementById('scriptComp').src = 'js/edit.js';
  }else {
    $('#stylesheetComp').attr('href','./home.css');  
    //document.getElementById('scriptComp').src = 'js/home.js';
  }

  next();
})


new Vue({
    router: router,
    el: '#app', 
})
