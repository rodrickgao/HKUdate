<template>
  <div id="app">
    <nav class="nav" v-if="showNav">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">🎓 HKU Date</router-link>
        <div class="nav-links">
          <router-link to="/dashboard">{{ t('nav.home') }}</router-link>
          <router-link to="/match">{{ t('nav.match') }}</router-link>
          <router-link to="/profile">{{ t('nav.profile') }}</router-link>
          <router-link to="/about">{{ t('nav.about') }}</router-link>
          <a href="#" @click.prevent="logout">{{ isEnglish ? 'Logout' : '退出' }}</a>
        </div>
      </div>
    </nav>
    <main class="page">
      <router-view />
    </main>
    <footer class="footer" v-if="showFooter">
      <div class="container">
        <p>© 2026 HKU Date | 港大校园交友平台</p>
        <p>
          <router-link to="/privacy">{{ t('footer.privacy') }}</router-link> · 
          <router-link to="/about">{{ t('footer.about') }}</router-link> · 
          <router-link to="/feedback">{{ t('footer.feedback') }}</router-link>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const i18n = inject('i18n')
const isEnglish = computed(() => i18n.state.lang === 'en')
const t = (key) => i18n.t(key)

const showNav = computed(() => {
  const publicRoutes = ['Home', 'Login', 'Register', 'Verify', 'About', 'Feedback', 'Changelog', 'ComingSoon', 'NotFound']
  return !publicRoutes.includes(route.name)
})

const showFooter = computed(() => {
  return ['Home', 'About'].includes(route.name)
})

const logout = () => {
  localStorage.removeItem('hkuuser')
  router.push('/')
}
</script>
