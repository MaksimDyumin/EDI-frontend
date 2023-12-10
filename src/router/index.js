// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware } from '@/middlewares/authMiddleware';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
        beforeEnter: authMiddleware
      },
      {
        path: '/incoming-ed/',
        name: 'incoming',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Incoming.vue'),
        beforeEnter: authMiddleware
      },
      {
        path: '/outgoing-ed/',
        name: 'outgoing',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Outgoing.vue'),
        beforeEnter: authMiddleware
      },
      {
        path: '/history/',
        name: 'history',
        component: () => import(/* webpackChunkName: "home" */ '@/views/History.vue'),
        beforeEnter: authMiddleware
      },
      {
        path: '/:incOut/overview/:docId',
        name: 'overview',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Overview.vue'),
        beforeEnter: authMiddleware
      },
      
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/default/Login.vue'),
    children: [
      {
        path: '/login/',
        name: 'login',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Login.vue'),
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
