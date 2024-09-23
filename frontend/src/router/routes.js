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
      { path: '', component: () => import('components/admin/AdminHome.vue') }
    ]
  },
  {
    path: '/physiotherapist',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/PhysiotherapistHome.vue') },
      { path: '/patient', component: () => import('components/PatientHome.vue') },
      { path: 'sessions/:sessionID', component: () => import('components/sessions/SessionViewModal.vue'), props: true },
      { path: 'sessions/:sessionID/exercise/:exerciseID', component: () => import('components/exercises/ExerciseViewModal.vue'), props: true }
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
