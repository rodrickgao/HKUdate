<template>
  <div class="page survey-page">
    <div class="survey-container">
      <div class="survey-card card">
        <div class="survey-header">
          <h1>完善你的资料</h1>
          <p>帮助我们更好地为你匹配</p>
        </div>

        <form @submit.prevent="handleSubmit" class="survey-form">
          <!-- Gender Selection -->
          <div class="form-group">
            <label class="form-label">你的性别</label>
            <div class="option-grid">
              <label class="option-card" :class="{ active: form.gender === 'male' }">
                <input type="radio" v-model="form.gender" value="male" />
                <span class="option-icon">👨</span>
                <span>男生</span>
              </label>
              <label class="option-card" :class="{ active: form.gender === 'female' }">
                <input type="radio" v-model="form.gender" value="female" />
                <span class="option-icon">👩</span>
                <span>女生</span>
              </label>
            </div>
          </div>

          <!-- Interested In -->
          <div class="form-group">
            <label class="form-label">你感兴趣的是</label>
            <div class="option-grid">
              <label class="option-card" :class="{ active: form.interestedIn === 'male' }">
                <input type="radio" v-model="form.interestedIn" value="male" />
                <span class="option-icon">👨</span>
                <span>男生</span>
              </label>
              <label class="option-card" :class="{ active: form.interestedIn === 'female' }">
                <input type="radio" v-model="form.interestedIn" value="female" />
                <span class="option-icon">👩</span>
                <span>女生</span>
              </label>
              <label class="option-card" :class="{ active: form.interestedIn === 'both' }">
                <input type="radio" v-model="form.interestedIn" value="both" />
                <span class="option-icon">👫</span>
                <span>都可以</span>
              </label>
            </div>
          </div>

          <!-- Year -->
          <div class="form-group">
            <label class="form-label">年级</label>
            <select v-model="form.year" class="form-input" required>
              <option value="">选择年级</option>
              <option value="1">本科一年级</option>
              <option value="2">本科二年级</option>
              <option value="3">本科三年级</option>
              <option value="4">本科四年级</option>
              <option value="5">硕士</option>
              <option value="6">博士</option>
              <option value="7">其他</option>
            </select>
          </div>

          <!-- Major -->
          <div class="form-group">
            <label class="form-label">专业</label>
            <input v-model="form.major" type="text" class="form-input" placeholder="你的专业" required />
          </div>

          <!-- Bio -->
          <div class="form-group">
            <label class="form-label">自我介绍</label>
            <textarea v-model="form.bio" class="form-input textarea" placeholder="介绍一下自己吧..." rows="4"></textarea>
          </div>

          <!-- Interests -->
          <div class="form-group">
            <label class="form-label">兴趣爱好（多选）</label>
            <div class="tag-grid">
              <label v-for="interest in interests" :key="interest" class="tag-label" :class="{ active: form.interests.includes(interest) }">
                <input type="checkbox" v-model="form.interests" :value="interest" />
                <span>{{ interest }}</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '保存中...' : '完成' }}
          </button>
        </form>
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
  gender: '',
  interestedIn: '',
  year: '',
  major: '',
  bio: '',
  interests: []
})

const interests = ['音乐', '电影', '运动', '旅行', '美食', '读书', '游戏', '摄影', '艺术', '健身', '编程', '社交']

const handleSubmit = async () => {
  if (!form.value.gender || !form.value.interestedIn || !form.value.year || !form.value.major) {
    alert('请完整填写所有必填项')
    return
  }
  
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
  router.push('/dashboard')
}
</script>

<style scoped>
.survey-page {
  min-height: 100vh;
  padding: var(--space-xl) 0;
  background: var(--gray-50);
}

.survey-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.survey-card {
  padding: var(--space-xl);
}

.survey-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.survey-header h1 {
  margin-bottom: var(--space-sm);
}

.survey-header p {
  color: var(--gray-600);
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition);
}

.option-card input {
  display: none;
}

.option-card:hover {
  border-color: var(--primary);
}

.option-card.active {
  border-color: var(--primary);
  background: rgba(0, 51, 102, 0.05);
}

.option-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-sm);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tag-label {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.875rem;
}

.tag-label input {
  display: none;
}

.tag-label:hover {
  border-color: var(--primary);
}

.tag-label.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.btn-block {
  width: 100%;
  padding: var(--space-md);
  font-size: 1rem;
  margin-top: var(--space-lg);
}
</style>
