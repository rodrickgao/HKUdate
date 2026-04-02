<template>
  <div class="page auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <router-link to="/" class="auth-logo">HKU Date</router-link>
          <h1>欢迎回来</h1>
          <p>登录你的港大账号</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input 
              v-model="form.email" 
              type="email" 
              class="form-input" 
              placeholder="yourname@hku.hk"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              v-model="form.password" 
              type="password" 
              class="form-input" 
              placeholder="请输入密码"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>还没有账号？ <router-link to="/register">立即注册</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
  router.push('/dashboard')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  padding: var(--space-md);
}

.auth-card {
  padding: var(--space-xl);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-logo {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
  display: block;
  margin-bottom: var(--space-lg);
}

.auth-header h1 {
  font-size: 1.75rem;
  margin-bottom: var(--space-sm);
}

.auth-header p {
  color: var(--gray-600);
}

.btn-block {
  width: 100%;
  padding: var(--space-md);
  font-size: 1rem;
}

.auth-footer {
  text-align: center;
  margin-top: var(--space-lg);
  color: var(--gray-600);
}

.auth-footer a {
  color: var(--primary);
  font-weight: 500;
}
</style>
