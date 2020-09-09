//each object is a route
import storyComp from './home.js'
import editComp from './edit.js'

export default [
    { path: '/', component: storyComp},
    { path: '/editMenu', component: editComp}
]
