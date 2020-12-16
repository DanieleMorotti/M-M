import Routes from './routes.js'

export const bus = new Vue();

const router = new VueRouter({
  routes: Routes,
})

router.beforeEach((to, from, next) => {
  if(to.path === '/editMenu') {
    $('#stylesheetComp').attr('href','./css/edit.css');
  }else {
    $('#stylesheetComp').attr('href','./css/home.css');  
  }

  next();
})


new Vue({
    router: router,
    el: '#app', 
})
