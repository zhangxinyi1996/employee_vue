import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue')
  },
  {
    path: '/top',
    name: 'Top',
    component: () => import('../views/Top.vue') // ← 追加
  },
  {
  path: '/employee_infoshow',
  name: 'EmployeeInfoShow',
  component: () => import('../views/employee_infoshow.vue')
},
{
  path: '/employee_info_edit',
  name: 'EmployeeInfo_info_edit',
  component: () => import('../views/employee_info_edit.vue')
},
{
    path: '/exchange_area',
    name: 'exchange_area',
    component: () => import('../views/exchange_area.vue') // ← 追加
  },
  {
    path: '/itexchange_area',
    name: 'itexchange_area',
    component: () => import('../views/itexchange_area.vue') // ← 追加
  },
   {
    path: '/employee_skillmap',
    name: 'employee_skillmap',
    component: () => import('../views/employee_skillmap.vue') // ← 追加
  },
   {
    path: '/employee_search',
    name: 'employee_search',
    component: () => import('../views/employee_search.vue') // ← 追加
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

// ナビゲーションガード（未ログインならログイン画面へ）
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)
  const token = localStorage.getItem('token')

  if (authRequired && !token) {
    return next('/login')
  }

  next()
})

export default router
