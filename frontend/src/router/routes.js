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
    path: '/resetpassword',
    component: () => import('components/PasswordResetPage.vue')
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/admin/AdminHome.vue') }
    ]
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/test_leader/TestLeaderHome.vue') },
      { path: 'sessions/:sessionID', component: () => import('components/sessions/SessionViewModal.vue'), props: true },
      { path: 'sessions/:sessionID/exercise/:exerciseID', component: () => import('components/exercises/ExerciseViewModal.vue'), props: true },
      { path: 'consent', component: () => import('components/test_leader/TestLeaderConsentPage.vue'), props: true },
      { path: 'invitation', component: () => import('components/admin/NewUserForm.vue'), props: true },
    ]
  },
  {
    path: '/patient',
    children: [
      { path: ':patientID/profile', component: () => import('components/patients/PatientHome.vue'), props: true }
    ]
  },
  {
    path: '/about',
    children: [
      { path: '', component: () => import('components/About.vue') }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/components/ErrorNotFound.vue')
  }
]

export default routes
