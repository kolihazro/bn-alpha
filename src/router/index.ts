import { createRouter, createWebHistory } from 'vue-router'
import Alpha from '../pages/alpha/Alpha.vue'
import Maker from '../pages/maker/Maker.vue'

const routes = [
  {
    path: '/',
    name: 'Alpha',
    component: Alpha
  },
  {
    path: '/maker',
    name: 'Maker',
    component: Maker
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
