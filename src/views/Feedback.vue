<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">📝 反馈</h1>
      <p class="page-subtitle">告诉我们您的想法</p>
    </div>
    
    <div class="card" style="max-width: 600px; margin: 0 auto;">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">反馈类型</label>
          <select v-model="feedback.type" required>
            <option value="">请选择</option>
            <option value="bug">报告 Bug</option>
            <option value="feature">功能建议</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">详细内容</label>
          <textarea v-model="feedback.content" placeholder="请详细描述您的问题或建议..." required rows="5"></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">联系方式（可选）</label>
          <input type="email" v-model="feedback.contact" placeholder="方便我们回复您" />
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? '提交中...' : '提交反馈' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const feedback = reactive({
  type: '',
  content: '',
  contact: ''
})

const handleSubmit = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 1000))
  
  // Save feedback (in real app, send to server)
  const feedbacks = JSON.parse(localStorage.getItem('hkufb') || '[]')
  feedbacks.push({ ...feedback, id: Date.now(), createdAt: new Date().toISOString() })
  localStorage.setItem('hkufb', JSON.stringify(feedbacks))
  
  alert('感谢您的反馈！')
  loading.value = false
  router.push('/dashboard')
}
</script>
