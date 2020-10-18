//each object is a route
import chatComp from './chat.js'
import valComp from './val.js'

export default [
    { path: '/', component: chatComp},
    { path: '/valMenu', component: valComp}
]
