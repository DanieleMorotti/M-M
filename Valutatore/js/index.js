import Routes from './routes.js'

//export const bus = new Vue();

const router = new VueRouter({
  routes: Routes,
})

//function that is executed before every routing change
router.beforeEach((to, from, next) => {
  if(to.path === '/valMenu') {
    $('#stylesheetComp').attr('href','/Valutatore/val.css');
  }else {
    $('#stylesheetComp').attr('href','/Valutatore/chat.css');  
  }

  next();
})


new Vue({
    router: router,
    el: '#app', 
})
