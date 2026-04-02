<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ t('register.title') }}</h1>
      <p class="page-subtitle">{{ t('register.subtitle') }}</p>
    </div>
    <div class="card" style="max-width: 400px; margin: 0 auto;">
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">{{ t('register.email') }}</label>
          <input type="email" v-model="email" :placeholder="isEnglish ? 'yourname@connect.hku.hk' : 'yourname@connect.hku.hk'" required />
          <p class="form-hint">{{ t('register.hint') }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('register.password') }}</label>
          <input type="password" v-model="password" :placeholder="isEnglish ? 'At least 6 characters' : '至少6位'" minlength="6" required />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('register.confirm') }}</label>
          <input type="password" v-model="confirmPassword" :placeholder="isEnglish ? 'Confirm password' : '再次输入密码'" required />
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <p v-if="success" class="form-success">{{ success }}</p>
        <button type="submit" class="btn btn-accent" style="width: 100%;" :disabled="loading">
          {{ loading ? (isEnglish ? 'Sending...' : '发送验证码...') : t('register.btn') }}
        </button>
      </form>
      <p class="text-center mt-2">
        {{ isEnglish ? 'Already have an account?' : '已有账号？' }} <router-link to="/login">{{ t('login.btn') }}</router-link>
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

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = ''
  
  if (!email.value.endsWith('@connect.hku.hk')) {
    error.value = isEnglish.value ? 'Only @connect.hku.hk emails allowed' : '仅支持 @connect.hku.hk 邮箱注册'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = isEnglish.value ? 'Passwords do not match' : '两次密码输入不一致'
    return
  }
  
  if (password.value.length < 6) {
    error.value = isEnglish.value ? 'Password must be at least 6 characters' : '密码至少6位'
    return
  }
  
  loading.value = true
  
  const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
  if (users.find(u => u.email === email.value)) {
    error.value = isEnglish.value ? 'Email already registered' : '该邮箱已注册'
    loading.value = false
    return
  }
  
  try {
    const res = await fetch('http://localhost:3003/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    
    const data = await res.json()
    
    if (data.success) {
      // 保存注册信息到临时存储
      localStorage.setItem('hku_reg_temp', JSON.stringify({
        email: email.value,
        password: password.value,
        code: data.code, // 开发模式会有code返回
        expires: Date.now() + 10 * 60 * 1000
      }))
      
      if (data.dev) {
        success.value = isEnglish.value 
          ? `Verification code sent! (Dev mode: ${data.code})`
          : `验证码已发送！（开发模式：${data.code}）`
      } else {
        success.value = isEnglish.value 
          ? 'Verification code sent to your email!'
          : '验证码已发送到您的邮箱！'
      }
      
      setTimeout(() => router.push('/verify'), 1500)
    } else {
      error.value = data.error
    }
  } catch (err) {
    // 如果服务器没运行，回退到本地模式
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    localStorage.setItem('hku_reg_temp', JSON.stringify({
      email: email.value,
      password: password.value,
      code: code,
      expires: Date.now() + 10 * 60 * 1000
    }))
    alert(isEnglish.value ? `Dev mode - Code: ${code}` : `开发模式 - 验证码：${code}`)
    router.push('/verify')
  }
  
  loading.value = false
}
</script>

<style scoped>
.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.form-success {
  color: var(--success);
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  background: rgba(56, 142, 60, 0.1);
  border-radius: 4px;
}
</style>
