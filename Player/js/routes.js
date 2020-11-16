let story = JSON.parse(localStorage.getItem("story"));

//each object is a route
import homeComp from './home.js'
import endComp from './over.js'

export default [
        { path: '/', component: homeComp},
        { path: '/device', component: () => import(`../../Server-side/devices/${story.device}/device.js`)},
        {path: '/end', component: endComp}
]