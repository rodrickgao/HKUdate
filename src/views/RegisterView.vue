<template>
  <div class="page auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <router-link to="/" class="auth-logo">HKU Date</router-link>
          <h1>加入 HKU Date</h1>
          <p>用你的 @hku.hk 邮箱注册</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input 
              v-model="form.name" 
              type="text" 
              class="form-input" 
              placeholder="你的名字"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input 
              v-model="form.email" 
              type="email" 
              class="form-input" 
              placeholder="yourname@connect.hku.hk"
              required
            />
            <small class="form-hint">仅支持 @hku.hk 邮箱</small>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              v-model="form.password" 
              type="password" 
              class="form-input" 
              placeholder="设置密码（至少8位）"
              required
              minlength="8"
            />
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              class="form-input" 
              placeholder="再次输入密码"
              required
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agree" required />
              <span>我同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a></span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading || !form.agree">
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>已有账号？ <router-link to="/login">立即登录</router-link></p>
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('两次密码输入不一致')
    return
  }
  
  if (!form.value.email.endsWith('@connect.hku.hk')) {
    alert('仅支持 @connect.hku.hk 邮箱注册')
    return
  }
  
  loading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
  // Redirect to verification page
  router.push({ path: '/verify', query: { email: form.value.email } })
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

.form-hint {
  display: block;
  margin-top: var(--space-xs);
  font-size: 0.875rem;
  color: var(--gray-500);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
}

.checkbox-label a {
  color: var(--primary);
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
