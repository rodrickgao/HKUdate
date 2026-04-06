<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ t('login.title') }}</h1>
      <p class="page-subtitle">{{ t('login.subtitle') }}</p>
    </div>
    <div class="card" style="max-width: 400px; margin: 0 auto;">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">{{ t('login.email') }}</label>
          <input type="email" v-model="email" placeholder="yourname@connect.hku.hk" required />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('login.password') }}</label>
          <input type="password" v-model="password" :placeholder="isEnglish ? 'Password' : '请输入密码'" required />
        </div>
        <div class="form-group remember-me">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span>{{ isEnglish ? 'Stay logged in' : '保持登录' }}</span>
          </label>
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? (isEnglish ? 'Loading...' : '登录中...') : t('login.btn') }}
        </button>
      </form>
      <p class="text-center mt-2">
        {{ t('login.noAccount') }}<router-link to="/register">{{ t('login.register') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const i18n = inject('i18n')
const isEnglish = computed(() => i18n.state.lang === 'en')
const t = (key) => i18n.t(key)

const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const loading = ref(false)
const error = ref('')

// Auto-login if user already exists
onMounted(() => {
  const savedUser = localStorage.getItem('hkuuser')
  if (savedUser) {
    router.push('/dashboard')
  }
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  if (!email.value.endsWith('@connect.hku.hk')) {
    error.value = isEnglish.value ? 'Please use @connect.hku.hk email' : '请使用 @connect.hku.hk 邮箱登录'
    loading.value = false
    return
  }
  
  try {
    const data = await api.login(email.value, password.value)
    
    if (data.success) {
      if (rememberMe.value) {
        localStorage.setItem('hkuuser', JSON.stringify(data.user))
      }
      sessionStorage.setItem('hkuuser', JSON.stringify(data.user))
      router.push(data.user.surveyCompleted ? '/dashboard' : '/survey')
    } else {
      error.value = data.error || (isEnglish.value ? 'Invalid email or password' : '邮箱或密码错误')
    }
  } catch (err) {
    // 回退到本地模式
    await new Promise(r => setTimeout(r, 500))
    
    const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
    const user = users.find(u => u.email === email.value && u.password === password.value)
    
    if (user) {
      if (rememberMe.value) {
        localStorage.setItem('hkuuser', JSON.stringify(user))
      }
      sessionStorage.setItem('hkuuser', JSON.stringify(user))
      router.push(user.surveyCompleted ? '/dashboard' : '/survey')
    } else {
      error.value = isEnglish.value ? 'Invalid email or password' : '邮箱或密码错误'
    }
  }
  
  loading.value = false
}
</script>

<style scoped>
.remember-me {
  margin-bottom: 16px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-label input {
  width: 18px;
  height: 18px;
}
</style>