<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">✨ 完善资料</h1>
      <p class="page-subtitle">让我们更好地了解你</p>
    </div>
    
    <div class="card" style="max-width: 700px; margin: 0 auto;">
      <form @submit.prevent="handleSurvey">
        <!-- 头像选择 -->
        <div class="form-section">
          <label class="form-label">🎨 选择头像</label>
          <div class="avatar-grid">
            <div 
              v-for="avatar in avatars" 
              :key="avatar"
              class="avatar-option"
              :class="{ selected: survey.avatar === avatar }"
              @click="survey.avatar = avatar"
            >
              {{ avatar }}
            </div>
          </div>
        </div>
        
        <!-- 基本信息 -->
        <div class="form-section">
          <label class="section-title">📝 基本信息</label>
          
          <div class="form-group">
            <label class="form-label">性别 *</label>
            <div class="radio-group">
              <label class="radio-label" v-for="g in genders" :key="g.value">
                <input type="radio" v-model="survey.gender" :value="g.value" required />
                <span class="radio-text">{{ g.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">年级 *</label>
              <select v-model="survey.grade" required>
                <option value="">请选择</option>
                <option value="1">本科一年级</option>
                <option value="2">本科二年级</option>
                <option value="3">本科三年级</option>
                <option value="4">本科四年级</option>
                <option value="5">硕士一年级</option>
                <option value="6">硕士二年级</option>
                <option value="7">硕士三年级及以上</option>
                <option value="8">博士</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">专业 *</label>
              <select v-model="survey.major" required>
                <option value="">请选择</option>
                <option value="金融学">金融学</option>
                <option value="会计学">会计学</option>
                <option value="经济学">经济学</option>
                <option value="商业分析">商业分析</option>
                <option value="市场学">市场学</option>
                <option value="人力资源管理">人力资源管理</option>
                <option value="计算机科学">计算机科学</option>
                <option value="数据科学">数据科学</option>
                <option value="工程学">工程学</option>
                <option value="法学">法学</option>
                <option value="医学">医学</option>
                <option value="建筑学">建筑学</option>
                <option value="心理学">心理学</option>
                <option value="传媒与媒体">传媒与媒体</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- 兴趣爱好 -->
        <div class="form-section">
          <label class="section-title">🎯 兴趣爱好（多选）</label>
          <div class="interests-grid">
            <label 
              class="interest-chip" 
              v-for="interest in interestOptions" 
              :key="interest"
              :class="{ selected: survey.interests.includes(interest) }"
            >
              <input type="checkbox" :value="interest" v-model="survey.interests" />
              {{ interest }}
            </label>
          </div>
        </div>
        
        <!-- 16型人格 -->
        <div class="form-section">
          <label class="section-title">🧠 16 Personalities（可选）</label>
          <div class="personality-grid">
            <select v-model="survey.personality" class="personality-select">
              <option value="">请选择（可选）</option>
              <optgroup label="分析师">
                <option value="INTJ">INTJ - 建筑师</option>
                <option value="INTP">INTP - 逻辑学家</option>
                <option value="ENTJ">ENTJ - 指挥官</option>
                <option value="ENTP">ENTP - 辩论家</option>
              </optgroup>
              <optgroup label="外交官">
                <option value="INFJ">INFJ - 提倡者</option>
                <option value="INFP">INFP - 调停者</option>
                <option value="ENFJ">ENFJ - 主人公</option>
                <option value="ENFP">ENFP - 竞选者</option>
              </optgroup>
              <optgroup label="守护者">
                <option value="ISTJ">ISTJ - 物流师</option>
                <option value="ISFJ">ISFJ - 守卫者</option>
                <option value="ESTJ">ESTJ - 总经理</option>
                <option value="ESFJ">ESFJ - 执政官</option>
              </optgroup>
              <optgroup label="探险家">
                <option value="ISFP">ISFP - 探险家</option>
                <option value="ISTP">ISTP - 鉴赏家</option>
                <option value="ESFP">ESFP - 表演者</option>
                <option value="ESTP">ESTP - 企业家</option>
              </optgroup>
            </select>
          </div>
        </div>
        
        <!-- 期望对象 -->
        <div class="form-section">
          <label class="section-title">💕 你期望的TA</label>
          
          <div class="form-group">
            <label class="form-label">性别要求</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="survey.preferGender" value="any" />
                <span class="radio-text">不限</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="survey.preferGender" value="male" />
                <span class="radio-text">男</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="survey.preferGender" value="female" />
                <span class="radio-text">女</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">年级要求</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="survey.preferGrade" value="same" />
                <span>同年级</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="survey.preferGrade" value="older" />
                <span>高年级</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="survey.preferGrade" value="younger" />
                <span>低年级</span>
              </label>
            </div>
          </div>

          <!-- 年龄要求 -->
          <div class="form-group">
            <label class="form-label">年龄要求</label>
            <div class="age-range">
              <select v-model="survey.preferAgeMin">
                <option value="18">18岁</option>
                <option value="19">19岁</option>
                <option value="20">20岁</option>
                <option value="21">21岁</option>
                <option value="22">22岁</option>
                <option value="23">23岁</option>
                <option value="24">24岁</option>
                <option value="25">25岁</option>
                <option value="any">不限</option>
              </select>
              <span class="age-separator">至</span>
              <select v-model="survey.preferAgeMax">
                <option value="18">18岁</option>
                <option value="19">19岁</option>
                <option value="20">20岁</option>
                <option value="21">21岁</option>
                <option value="22">22岁</option>
                <option value="23">23岁</option>
                <option value="24">24岁</option>
                <option value="25">25岁</option>
                <option value="any">不限</option>
              </select>
            </div>
          </div>

          <!-- 性格特征要求 -->
          <div class="form-group">
            <label class="form-label">期望的性格特征（多选）</label>
            <div class="traits-grid">
              <label 
                class="trait-chip" 
                v-for="trait in personalityTraits" 
                :key="trait"
                :class="{ selected: survey.preferTraits.includes(trait) }"
              >
                <input type="checkbox" :value="trait" v-model="survey.preferTraits" />
                {{ trait }}
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">其他描述 *</label>
            <textarea 
              v-model="survey.preference" 
              placeholder="描述你期望的另一半：性格、兴趣、身高、星座等..." 
              required
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <p v-if="error" class="form-error">{{ error }}</p>
        <button type="submit" class="btn btn-accent btn-large" :disabled="loading">
          {{ loading ? '提交中...' : '完成问卷' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const avatars = ['🦊', '🐱', '🐶', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐙', '🦋', '🐯', '🦄', '🐲', '🦅']

const genders = [
  { value: 'male', label: '👨 男' },
  { value: 'female', label: '👩 女' },
  { value: 'other', label: '🧑 其他' }
]

const interestOptions = [
  '📚 阅读', '🎵 音乐', '🎬 影视', '📷 摄影', '🏃 运动', '🍳 烹饪',
  '✈️ 旅行', '🎮 游戏', '💻 编程', '🎨 绘画', '🧘 瑜伽', '🏊 游泳',
  '⚽ 足球', '🏀 篮球', '🎾 网球', '🏸 羽毛球', '💃 舞蹈', '🎤 KTV',
  '☕ 咖啡', '🍜 美食', '🐱 撸猫', '🐶 遛狗', '🌸 园艺', '📖 写作'
]

// 性格特征选项
const personalityTraits = [
  '😊 乐观开朗', '🤔 理性成熟', '❤️ 温柔体贴', '💪 上进心强',
  '🎯 目标明确', '😄 幽默风趣', '📖 热爱学习', '🎵 喜欢音乐',
  '🏃 热爱运动', '🌟 有才华', '💕 浪漫', '👂 善于倾听',
  '🏠 顾家', '🐶 喜欢小动物', '✈️ 喜欢旅行', '🍳 会做饭'
]

const survey = reactive({
  avatar: '🦊',
  gender: '',
  grade: '',
  major: '',
  interests: [],
  personality: '',
  preferGender: 'any',
  preferGrade: [],
  preferAgeMin: '18',
  preferAgeMax: '25',
  preferTraits: [],
  preference: ''
})

const handleSurvey = async () => {
  error.value = ''
  loading.value = true
  
  if (!survey.gender || !survey.grade || !survey.major) {
    error.value = '请填写所有必填项'
    loading.value = false
    return
  }
  
  if (survey.interests.length === 0) {
    error.value = '请至少选择一个兴趣爱好'
    loading.value = false
    return
  }
  
  if (!survey.preference) {
    error.value = '请描述你期望的TA'
    loading.value = false
    return
  }
  
  const user = JSON.parse(localStorage.getItem('hkuuser'))
  
  try {
    const data = await api.updateSurvey(user.id, { ...survey })
    
    if (data.success) {
      user.surveyCompleted = true
      user.survey = { ...survey }
      localStorage.setItem('hkuuser', JSON.stringify(user))
      router.push('/dashboard')
    } else {
      error.value = data.error || '提交失败'
    }
  } catch (err) {
    // 回退到本地模式
    await new Promise(r => setTimeout(r, 500))
    
    user.surveyCompleted = true
    user.survey = { ...survey }
    
    const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
    const idx = users.findIndex(u => u.id === user.id)
    if (idx >= 0) {
      users[idx] = user
      localStorage.setItem('hkusrs', JSON.stringify(users))
    }
    
    localStorage.setItem('hkuuser', JSON.stringify(user))
    router.push('/dashboard')
  }
  
  loading.value = false
}
</script>

<style scoped>
.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}

.avatar-option {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option:hover {
  border-color: var(--primary-light);
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: var(--primary);
  background: rgba(30, 77, 43, 0.1);
}

.radio-group, .checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.radio-label, .checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-label input, .checkbox-label input {
  width: 18px;
  height: 18px;
}

.radio-text {
  font-size: 16px;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}

.interest-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.interest-chip input {
  display: none;
}

.interest-chip:hover {
  border-color: var(--accent);
}

.interest-chip.selected {
  border-color: var(--accent);
  background: rgba(195, 161, 91, 0.15);
  color: var(--accent-dark);
}

.personality-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  background: white;
}

.personality-select:focus {
  outline: none;
  border-color: var(--primary);
}

.age-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.age-range select {
  flex: 1;
}

.age-separator {
  color: var(--text-light);
}

.traits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.trait-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.trait-chip input {
  display: none;
}

.trait-chip:hover {
  border-color: var(--primary);
}

.trait-chip.selected {
  border-color: var(--primary);
  background: rgba(30, 77, 43, 0.1);
  color: var(--primary);
}

.btn-large {
  width: 100%;
  padding: 16px 32px;
  font-size: 18px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}
</style>
