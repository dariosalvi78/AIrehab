const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('components/LoginPage.vue')
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/AdminHome.vue') }
    ]
  },
  {
    path: '/physiotherapist',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/PhysiotherapistHome.vue') },
      { path: '/patient', component: () => import('components/PatientHome.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
