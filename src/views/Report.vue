<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">⚠️ 举报</h1>
      <p class="page-subtitle">举报违规用户或内容</p>
    </div>
    
    <div class="card" style="max-width: 600px; margin: 0 auto;">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">举报原因</label>
          <select v-model="report.reason" required>
            <option value="">请选择</option>
            <option value="fake">虚假信息</option>
            <option value="harassment">骚扰行为</option>
            <option value="spam">垃圾信息</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">详细说明</label>
          <textarea v-model="report.description" placeholder="请描述具体情况..." required rows="5"></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">证据截图（可选）</label>
          <input type="file" @change="handleFile" accept="image/*" />
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? '提交中...' : '提交举报' }}
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

const report = reactive({
  reason: '',
  description: '',
  screenshot: null
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (file) {
    report.screenshot = file.name
  }
}

const handleSubmit = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 1000))
  
  alert('举报已提交，我们会尽快处理')
  loading.value = false
  router.push('/match')
}
</script>
