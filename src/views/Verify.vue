<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ t('verify.title') }}</h1>
      <p class="page-subtitle">{{ t('verify.subtitle') }}</p>
    </div>
    <div class="card" style="max-width: 400px; margin: 0 auto;">
      <form @submit.prevent="handleVerify">
        <div class="form-group">
          <label class="form-label">{{ t('verify.code') }}</label>
          <input type="text" v-model="code" placeholder="000000" maxlength="6" required class="code-input" />
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? (isEnglish ? 'Verifying...' : '验证中...') : t('verify.btn') }}
        </button>
      </form>
      <p class="text-center mt-2">
        <router-link to="/register">{{ t('verify.resend') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const i18n = inject('i18n')
const isEnglish = computed(() => i18n.state.lang === 'en')
const t = (key) => i18n.t(key)

const code = ref('')
const loading = ref(false)
const error = ref('')

const handleVerify = async () => {
  error.value = ''
  loading.value = true
  
  const temp = JSON.parse(localStorage.getItem('hku_reg_temp') || '{}')
  
  if (!temp.email) {
    error.value = isEnglish.value ? 'Please register first' : '请先注册'
    router.push('/register')
    return
  }
  
  try {
    const res = await fetch('http://localhost:3003/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: temp.email, code: code.value })
    })
    
    const data = await res.json()
    
    if (data.success) {
      // 创建用户
      const user = {
        id: Date.now().toString(),
        email: temp.email,
        password: temp.password,
        surveyCompleted: false,
        survey: null,
        createdAt: new Date().toISOString()
      }
      
      const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
      users.push(user)
      localStorage.setItem('hkusrs', JSON.stringify(users))
      localStorage.setItem('hkuuser', JSON.stringify(user))
      localStorage.removeItem('hku_reg_temp')
      
      router.push('/survey')
    } else {
      error.value = data.error || (isEnglish.value ? 'Invalid code' : '验证码错误')
    }
  } catch (err) {
    // 回退到本地验证
    if (Date.now() > temp.expires) {
      error.value = isEnglish.value ? 'Code expired, please register again' : '验证码已过期，请重新注册'
      localStorage.removeItem('hku_reg_temp')
      router.push('/register')
      return
    }
    
    if (code.value !== temp.code) {
      error.value = isEnglish.value ? 'Invalid code' : '验证码错误'
    } else {
      const user = {
        id: Date.now().toString(),
        email: temp.email,
        password: temp.password,
        surveyCompleted: false,
        survey: null,
        createdAt: new Date().toISOString()
      }
      
      const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
      users.push(user)
      localStorage.setItem('hkusrs', JSON.stringify(users))
      localStorage.setItem('hkuuser', JSON.stringify(user))
      localStorage.removeItem('hku_reg_temp')
      
      router.push('/survey')
    }
  }
  
  loading.value = false
}
</script>

<style scoped>
.code-input {
  font-size: 32px;
  text-align: center;
  letter-spacing: 8px;
}
</style>
