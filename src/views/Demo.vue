<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">🎭 测试账号登录</h1>
      <p class="page-subtitle">选择一个虚拟账号，直接测试匹配算法与配对结果</p>
    </div>

    <div class="card demo-card">
      <p v-if="loading" class="demo-status">正在准备测试账号...</p>
      <p v-else-if="error" class="form-error">{{ error }}</p>
      <p v-else class="demo-status">
        当前已准备 <strong>{{ testUsers.length }}</strong> 个可用测试账号
      </p>

      <p v-if="success" class="form-success">{{ success }}</p>

      <div v-if="!loading && testUsers.length" class="demo-grid">
        <button
          v-for="user in testUsers"
          :key="user.id || user.email"
          type="button"
          class="demo-user"
          @click="loginAs(user)"
          :disabled="submitting"
        >
          <div class="demo-avatar">{{ user.survey?.avatar || '👤' }}</div>
          <div class="demo-info">
            <strong>{{ user.email.split('@')[0] }}</strong>
            <span>{{ user.survey?.major || '未填写专业' }} · {{ gradeLabel(user.survey?.grade) }}</span>
            <span class="demo-personality">{{ user.survey?.personality || '未填写人格' }}</span>
          </div>
        </button>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <p>暂时没有可用测试账号，请稍后重试。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const success = ref('')
const error = ref('')
const testUsers = ref([])

const fallbackUsers = (() => {
  const avatars = ['🦊', '🐱', '🐶', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐙', '🦋', '🦄', '🐲', '🦅', '🐰', '🐻', '🦉']
  const genders = ['male', 'female']
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8']
  const majors = ['金融学', '会计学', '经济学', '商业分析', '市场学', '人力资源管理', '计算机科学', '数据科学', '工程学', '法学', '医学', '建筑学', '心理学', '传媒与媒体', '新闻学', '社会学']
  const interests = [
    ['📚 阅读', '🎵 音乐', '✈️ 旅行'], ['📚 阅读', '🧘 瑜伽', '🐱 撸猫'],
    ['💻 编程', '🎮 游戏', '🎵 音乐'], ['💻 编程', '📚 阅读', '🎨 绘画'],
    ['🎬 影视', '📷 摄影', '☕ 咖啡'], ['🎬 影视', '🎵 音乐', '🍜 美食'],
    ['⚽ 足球', '🏀 篮球', '🎵 音乐'], ['⚽ 足球', '🏃 运动', '🎮 游戏'],
    ['✈️ 旅行', '📷 摄影', '🍜 美食'], ['✈️ 旅行', '🎬 影视', '📚 阅读'],
    ['🎮 游戏', '🎤 KTV', '☕ 咖啡'], ['🎮 游戏', '💻 编程', '🎵 音乐'],
    ['🍳 烹饪', '📚 阅读', '🎵 音乐'], ['🍳 烹饪', '🍜 美食', '🎬 影视'],
    ['🧘 瑜伽', '📚 阅读', '🐱 撸猫'], ['🏃 运动', '⚽ 足球', '🎵 音乐'],
    ['🎨 绘画', '📷 摄影', '🎵 音乐'], ['📷 摄影', '🎬 影视', '✈️ 旅行']
  ]
  const personalities = ['INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'INTJ', 'INTP', 'ENTJ', 'ENTP', 'ISFP', 'ISTP', 'ESFP', 'ESTP']
  const preferGenders = ['any', 'any', 'any', 'male', 'female']
  const preferences = [
    '希望认识有趣的人，一起探索香港',
    '喜欢技术型的人，能一起讨论代码',
    '喜欢拍照和喝咖啡的人',
    '爱运动，阳光型',
    '喜欢安静文艺的人',
    '数据爱好者，喜欢分析',
    '喜欢探索美食和旅行',
    '爱运动，爱唱歌'
  ]

  const users = []
  for (let i = 1; i <= 24; i++) {
    users.push({
      id: `fallback-${i}`,
      email: `user${i}@connect.hku.hk`,
      password: 'test123',
      surveyCompleted: true,
      survey: {
        avatar: avatars[i % avatars.length],
        gender: genders[i % 2],
        grade: grades[i % grades.length],
        major: majors[i % majors.length],
        interests: interests[i % interests.length],
        personality: personalities[i % personalities.length],
        preferGender: preferGenders[i % preferGenders.length],
        preferGrade: [],
        preferAgeMin: '18',
        preferAgeMax: '25',
        preferTraits: [],
        preference: preferences[i % preferences.length],
      },
    })
  }
  return users
})()

const gradeLabel = (g) => ({
  '1': '本科一', '2': '本科二', '3': '本科三', '4': '本科四',
  '5': '硕士一', '6': '硕士二', '7': '硕士三', '8': '博士'
}[String(g)] || g || '-')

const isDemoEmail = (email = '') => /^user\d+@connect\.hku\.hk$/.test(email)

const sortByUserIndex = (users) => [...users].sort((a, b) => {
  const ai = Number((a.email.match(/user(\d+)@/) || [])[1] || 0)
  const bi = Number((b.email.match(/user(\d+)@/) || [])[1] || 0)
  return ai - bi
})

const loadTestUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    await api.seedTestUsers()
    const data = await api.getUsers()

    if (!data.success || !Array.isArray(data.users)) {
      throw new Error('无法获取测试账号列表')
    }

    const demoUsers = sortByUserIndex(
      data.users.filter(user => isDemoEmail(user.email) && user.surveyCompleted && user.survey)
    )

    testUsers.value = demoUsers

    if (!demoUsers.length) {
      throw new Error('测试账号初始化失败')
    }
  } catch (err) {
    testUsers.value = fallbackUsers
    error.value = '后端测试账号暂时不可用，已切换到本地演示账号。若要测试真实匹配结果，请确认线上 API 已正常部署。'
  } finally {
    loading.value = false
  }
}

const loginAs = async (user) => {
  success.value = ''
  error.value = ''
  submitting.value = true

  try {
    const data = await api.login(user.email, 'test123')

    if (data.success && data.user?.id) {
      localStorage.setItem('hkuuser', JSON.stringify(data.user))
      sessionStorage.setItem('hkuuser', JSON.stringify(data.user))
      success.value = `已登录为 ${user.email}，正在进入匹配页...`
      setTimeout(() => router.push('/match'), 300)
      return
    }

    throw new Error(data.error || '测试账号登录失败')
  } catch (err) {
    localStorage.setItem('hkuuser', JSON.stringify(user))
    sessionStorage.setItem('hkuuser', JSON.stringify(user))
    success.value = `已登录为 ${user.email}（本地演示模式）`
    setTimeout(() => router.push('/match'), 500)
  } finally {
    submitting.value = false
  }
}

onMounted(loadTestUsers)
</script>

<style scoped>
.demo-card {
  max-width: 960px;
  margin: 0 auto;
}

.demo-status {
  margin-bottom: 16px;
  color: var(--text-light);
  text-align: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.demo-user {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  text-align: left;
}

.demo-user:hover:not(:disabled) {
  border-color: var(--primary);
  background: rgba(30, 77, 43, 0.05);
  transform: translateY(-2px);
}

.demo-user:disabled {
  cursor: wait;
  opacity: 0.7;
}

.demo-avatar {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: 50%;
  flex-shrink: 0;
}

.demo-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.demo-info strong {
  font-size: 14px;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-info span {
  font-size: 11px;
  color: var(--gray-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-personality {
  font-size: 10px !important;
  color: var(--accent-dark) !important;
  font-weight: 600;
}

.form-success {
  color: var(--success);
  padding: 12px;
  background: rgba(56, 142, 60, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.form-error {
  color: #c62828;
  padding: 12px;
  background: rgba(198, 40, 40, 0.08);
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--text-light);
}
</style>
