import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import SurveyView from '../views/SurveyView.vue'
import DashboardView from '../views/DashboardView.vue'
import MatchView from '../views/MatchView.vue'
import ProfileView from '../views/ProfileView.vue'
import AboutView from '../views/AboutView.vue'
import VerifyView from '../views/VerifyView.vue'
import DemoView from '../views/Demo.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/survey',
      name: 'survey',
      component: SurveyView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/match',
      name: 'match',
      component: MatchView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/verify',
      name: 'verify',
      component: VerifyView
    },
    {
      path: '/demo',
      name: 'demo',
      component: DemoView
    }
  ]
})

export default router
