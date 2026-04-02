<template>
  <div class="page verify-page">
    <div class="verify-container">
      <div class="verify-card card">
        <div class="verify-header">
          <div class="verify-icon">📧</div>
          <h1>验证你的邮箱</h1>
          <p>我们已向 {{ email }} 发送了验证邮件</p>
        </div>

        <div class="verify-form" v-if="!verified">
          <p class="verify-instruction">请输入收到的6位验证码</p>
          
          <div class="code-input-group">
            <input 
              v-for="(digit, index) in code" 
              :key="index"
              :ref="el => inputs[index] = el"
              v-model="code[index]"
              type="text" 
              maxlength="1"
              class="code-input"
              @input="handleInput(index)"
              @keydown.backspace="handleBackspace(index)"
              @paste="handlePaste"
            />
          </div>

          <button class="btn btn-primary btn-block" @click="verifyCode" :disabled="code.join('').length < 6 || verifying">
            {{ verifying ? '验证中...' : '验证' }}
          </button>

          <p class="resend-text">
            没有收到邮件？
            <button class="link-btn" @click="resendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}秒后重新发送` : '重新发送' }}
            </button>
          </p>

          <!-- Demo hint -->
          <div class="demo-hint">
            <p>📌 Demo: 验证码是 <strong>123456</strong></p>
          </div>
        </div>

        <div class="verify-success" v-else>
          <div class="success-icon">✅</div>
          <h2>验证成功！</h2>
          <p>欢迎加入 HKU Date</p>
          <router-link to="/dashboard" class="btn btn-primary btn-block">开始使用</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const email = ref(route.query.email || 'youremail@connect.hku.hk')
const code = ref(['', '', '', '', '', ''])
const inputs = ref([])
const verified = ref(false)
const verifying = ref(false)
const countdown = ref(0)

const handleInput = (index) => {
  if (code.value[index] && index < 5) {
    inputs.value[index + 1]?.focus()
  }
}

const handleBackspace = (index) => {
  if (!code.value[index] && index > 0) {
    code.value[index - 1] = ''
    inputs.value[index - 1]?.focus()
  }
}

const handlePaste = (e) => {
  e.preventDefault()
  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) {
    code.value[i] = pasted[i] || ''
  }
}

const verifyCode = async () => {
  const enteredCode = code.value.join('')
  
  if (enteredCode === '123456') {
    verified.value = true
  } else {
    alert('验证码错误，请重试')
  }
}

const resendCode = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
  alert('验证码已重新发送！')
}

onMounted(() => {
  // Start countdown for demo
  resendCode()
})
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.verify-container {
  width: 100%;
  max-width: 420px;
  padding: var(--space-md);
}

.verify-card {
  padding: var(--space-xl);
  text-align: center;
}

.verify-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.verify-header h1 {
  font-size: 1.5rem;
  margin-bottom: var(--space-sm);
}

.verify-header p {
  color: var(--gray-600);
  margin-bottom: var(--space-lg);
}

.verify-instruction {
  color: var(--gray-600);
  margin-bottom: var(--space-md);
}

.code-input-group {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.code-input {
  width: 45px;
  height: 55px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  transition: var(--transition);
}

.code-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
}

.btn-block {
  width: 100%;
  padding: var(--space-md);
}

.resend-text {
  margin-top: var(--space-lg);
  color: var(--gray-600);
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: inherit;
}

.link-btn:disabled {
  color: var(--gray-400);
  cursor: not-allowed;
}

.demo-hint {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--gray-100);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--gray-600);
}

.verify-success {
  padding: var(--space-lg) 0;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
}

.verify-success h2 {
  margin-bottom: var(--space-sm);
}
</style>
