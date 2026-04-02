<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ t('profile.title') }}</h1>
    </div>
    
    <div class="card" style="max-width: 600px; margin: 0 auto;">
      <div class="profile-header">
        <div class="profile-avatar">{{ user?.survey?.avatar || '🦊' }}</div>
        <div class="profile-info">
          <h2>{{ user?.email }}</h2>
          <p>{{ isEnglish ? 'Registered:' : '注册于：' }} {{ formatDate(user?.createdAt) }}</p>
        </div>
      </div>
      
      <div class="profile-section" v-if="user?.surveyCompleted">
        <h3>📋 {{ t('profile.info') }}</h3>
        
        <!-- View Mode -->
        <div v-if="!isEditing">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ t('profile.gender') }}</span>
              <span class="info-value">{{ getGender(user.survey.gender) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('profile.grade') }}</span>
              <span class="info-value">{{ t('grade.' + user.survey.grade) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('profile.major') }}</span>
              <span class="info-value">{{ user.survey.major }}</span>
            </div>
            <div class="info-item" v-if="user.survey.personality">
              <span class="info-label">{{ t('profile.personality') }}</span>
              <span class="info-value">{{ user.survey.personality }}</span>
            </div>
          </div>
          <div class="info-full">
            <span class="info-label">{{ t('profile.interests') }}</span>
            <p class="info-value">{{ user.survey.interests?.join(', ') }}</p>
          </div>
          <div class="info-full">
            <span class="info-label">{{ t('profile.prefer') }}</span>
            <p class="info-value">{{ user.survey.preference }}</p>
          </div>
          
          <div class="profile-actions">
            <button @click="isEditing = true" class="btn btn-outline">{{ t('profile.edit') }}</button>
          </div>
        </div>
        
        <!-- Edit Mode -->
        <div v-else class="edit-form">
          <div class="form-group">
            <label class="form-label">{{ t('survey.avatar') }}</label>
            <div class="avatar-grid">
              <div 
                v-for="avatar in avatars" 
                :key="avatar"
                class="avatar-option"
                :class="{ selected: editData.avatar === avatar }"
                @click="editData.avatar = avatar"
              >
                {{ avatar }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('survey.gender') }}</label>
            <select v-model="editData.gender">
              <option value="male">{{ isEnglish ? 'Male' : '男' }}</option>
              <option value="female">{{ isEnglish ? 'Female' : '女' }}</option>
              <option value="other">{{ isEnglish ? 'Other' : '其他' }}</option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ t('survey.grade') }}</label>
              <select v-model="editData.grade">
                <option value="1">{{ t('grade.1') }}</option>
                <option value="2">{{ t('grade.2') }}</option>
                <option value="3">{{ t('grade.3') }}</option>
                <option value="4">{{ t('grade.4') }}</option>
                <option value="5">{{ t('grade.5') }}</option>
                <option value="6">{{ t('grade.6') }}</option>
                <option value="7">{{ t('grade.7') }}</option>
                <option value="8">{{ t('grade.8') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('survey.major') }}</label>
              <select v-model="editData.major">
                <option value="金融学">金融学</option>
                <option value="会计学">会计学</option>
                <option value="经济学">经济学</option>
                <option value="计算机科学">计算机科学</option>
                <option value="数据科学">数据科学</option>
                <option value="工程学">工程学</option>
                <option value="法学">法学</option>
                <option value="医学">医学</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('survey.personality') }}</label>
            <select v-model="editData.personality">
              <option value="">--</option>
              <option value="INFJ">INFJ</option>
              <option value="INFP">INFP</option>
              <option value="ENFJ">ENFJ</option>
              <option value="ENFP">ENFP</option>
              <option value="INTJ">INTJ</option>
              <option value="INTP">INTP</option>
              <option value="ENTJ">ENTJ</option>
              <option value="ENTP">ENTP</option>
              <option value="ISFP">ISFP</option>
              <option value="ISTP">ISTP</option>
              <option value="ESFP">ESFP</option>
              <option value="ESTP">ESTP</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('survey.interests') }}</label>
            <div class="interests-edit">
              <label 
                class="interest-chip" 
                v-for="interest in interestOptions" 
                :key="interest"
                :class="{ selected: editData.interests.includes(interest) }"
              >
                <input type="checkbox" :value="interest" v-model="editData.interests" />
                {{ interest }}
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">{{ t('survey.other') }}</label>
            <textarea v-model="editData.preference" rows="3"></textarea>
          </div>
          
          <p v-if="saveStatus" class="save-status">{{ saveStatus }}</p>
          
          <div class="profile-actions edit-actions">
            <button @click="saveProfile" class="btn btn-primary">{{ isEnglish ? 'Save' : '保存' }}</button>
            <button @click="cancelEdit" class="btn btn-outline">{{ isEnglish ? 'Cancel' : '取消' }}</button>
          </div>
        </div>
      </div>
      
      <div class="profile-section" v-else>
        <p>{{ isEnglish ? "You haven't completed the survey yet" : '您还没有完成问卷' }}</p>
        <router-link to="/survey" class="btn btn-accent">{{ isEnglish ? 'Fill Survey' : '填写问卷' }}</router-link>
      </div>
      
      <div class="profile-danger">
        <h3>⚠️ {{ t('profile.danger') }}</h3>
        <button @click="deleteAccount" class="btn btn-danger">{{ t('profile.delete') }}</button>
        <p class="danger-hint">{{ isEnglish ? 'This cannot be undone' : '删除后无法恢复' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const i18n = inject('i18n')
const isEnglish = computed(() => i18n.state.lang === 'en')
const t = (key) => i18n.t(key)

const user = ref(null)
const isEditing = ref(false)
const saveStatus = ref('')

const avatars = ['🦊', '🐱', '🐶', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐙', '🦋', '🦄', '🐲', '🦅', '🐰']
const interestOptions = [
  '📚 阅读', '🎵 音乐', '🎬 影视', '📷 摄影', '🏃 运动', '🍳 烹饪',
  '✈️ 旅行', '🎮 游戏', '💻 编程', '🎨 绘画', '🧘 瑜伽', '🏊 游泳',
  '⚽ 足球', '🏀 篮球', '🎾 网球', '💃 舞蹈', '☕ 咖啡', '🍜 美食'
]

const editData = ref({
  avatar: '🦊',
  gender: 'male',
  grade: '1',
  major: '金融学',
  personality: '',
  interests: [],
  preference: ''
})

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('hkuuser') || sessionStorage.getItem('hkuuser') || 'null')
  if (user.value?.survey) {
    editData.value = { ...user.value.survey }
  }
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(isEnglish.value ? 'en-US' : 'zh-CN')
}

const getGender = (g) => {
  const map = { male: isEnglish.value ? 'Male' : '男', female: isEnglish.value ? 'Female' : '女', other: isEnglish.value ? 'Other' : '其他' }
  return map[g] || g
}

const saveProfile = () => {
  saveStatus.value = isEnglish.value ? '💾 Saving...' : '💾 保存中...'
  
  user.value.survey = { ...editData.value }
  
  // Update localStorage
  localStorage.setItem('hkuuser', JSON.stringify(user.value))
  
  // Update session storage if exists
  const sessionUser = JSON.parse(sessionStorage.getItem('hkuuser') || 'null')
  if (sessionUser) {
    sessionStorage.setItem('hkuuser', JSON.stringify(user.value))
  }
  
  // Update users list
  const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
  const idx = users.findIndex(u => u.id === user.value.id)
  if (idx >= 0) {
    users[idx] = user.value
    localStorage.setItem('hkusrs', JSON.stringify(users))
  }
  
  setTimeout(() => {
    saveStatus.value = isEnglish.value ? '✅ Saved!' : '✅ 保存成功！'
    isEditing.value = false
    setTimeout(() => saveStatus.value = '', 2000)
  }, 500)
}

const autoSave = () => {
  // Legacy function kept for compatibility
}

const cancelEdit = () => {
  isEditing.value = false
  if (user.value?.survey) {
    editData.value = { ...user.value.survey }
  }
}

const deleteAccount = () => {
  const msg = isEnglish.value ? 'Are you sure? This cannot be undone!' : '确定要删除账户吗？此操作不可恢复！'
  if (confirm(msg)) {
    const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
    const filtered = users.filter(u => u.id !== user.value.id)
    localStorage.setItem('hkusrs', JSON.stringify(filtered))
    localStorage.removeItem('hkuuser')
    sessionStorage.removeItem('hkuuser')
    router.push('/')
  }
}
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.profile-avatar {
  font-size: 64px;
}

.profile-info h2 {
  color: var(--primary);
  margin-bottom: 4px;
}

.profile-info p {
  color: var(--text-muted);
  font-size: 14px;
}

.profile-section {
  margin-bottom: 32px;
}

.profile-section h3 {
  color: var(--primary);
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: var(--text-muted);
}

.info-value {
  color: var(--text);
  font-weight: 500;
}

.info-full {
  margin-bottom: 16px;
}

.info-full .info-value {
  font-weight: 400;
  margin-top: 4px;
}

.profile-actions {
  margin-top: 16px;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.edit-actions .btn {
  flex: 1;
}

.edit-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.avatar-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.avatar-option.selected {
  border-color: var(--primary);
  background: rgba(30, 77, 43, 0.1);
}

.interests-edit {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interest-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
}

.interest-chip input {
  display: none;
}

.interest-chip.selected {
  border-color: var(--accent);
  background: rgba(195, 161, 91, 0.15);
}

.save-status {
  color: var(--success);
  font-size: 14px;
  margin: 8px 0;
}

.profile-danger {
  border-top: 1px solid var(--border);
  padding-top: 24px;
}

.profile-danger h3 {
  color: var(--error);
  margin-bottom: 16px;
}

.btn-danger {
  background: var(--error);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.danger-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}
</style>