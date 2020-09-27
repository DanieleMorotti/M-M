

let story = JSON.parse(localStorage.getItem("story"));

//each object is a route
import homeComp from './home.js'
//import deviceComp from '/device.js'
import deviceComp from '/getDeviceJs'
import doorComp from '../widgets/door.js'
import lockComp from '../widgets/lock.js'



export default [
        { path: '/', component: homeComp},
        { path: '/device', component: deviceComp},
        { path: '/door', component: doorComp},
        { path: '/lock', component: lockComp}
]