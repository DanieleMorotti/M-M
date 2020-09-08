import Routes from './routes.js'

const router = new VueRouter({
  routes: Routes,
})

//function that is executed before every routing change
router.beforeEach((to, from, next) => {
  if(to.path === '/editMenu') {
    document.getElementById('stylesheetComp').href = './edit.css';
    document.getElementById('scriptComp').src = './edit.js';
  }else {
    document.getElementById('stylesheetComp').href ='./home.css';  
    document.getElementById('scriptComp').src = './home.js';
  }

  next();
})


new Vue({
    router: router,
    el: '#app',
  
})
