//each object is a route
import storyComp from './home.js'
import activityComp from './edit.js'

export default [
    { path: '/', component: storyComp},
    { path: '/activities', component: activityComp}
]