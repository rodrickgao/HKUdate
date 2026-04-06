<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">🎭 测试账号登录</h1>
      <p class="page-subtitle">选择一个账号体验完整功能</p>
    </div>
    <div class="card" style="max-width: 900px; margin: 0 auto;">
      <p v-if="success" class="form-success">{{ success }}</p>
      <div class="demo-grid">
        <div
          v-for="user in testUsers"
          :key="user.email"
          class="demo-user"
          @click="loginAs(user)"
        >
          <div class="demo-avatar">{{ user.survey.avatar }}</div>
          <div class="demo-info">
            <strong>{{ user.email.split('@')[0] }}</strong>
            <span>{{ user.survey.major }} · {{ gradeLabel(user.survey.grade) }}</span>
            <span class="demo-personality">{{ user.survey.personality }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const success = ref('')

// 生成100个测试用户
const avatars = ['🦊', '🐱', '🐶', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐙', '🦋', '🐯', '🦄', '🐲', '🦅', '🐰', '🐻', '🐷', '🦉']
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
  ['🎨 绘画', '📷 摄影', '🎵 音乐'], ['🎨 绘画', '🏃 运动', '✈️ 旅行'],
  ['📷 摄影', '🎬 影视', '✈️ 旅行'], ['📷 摄影', '🎨 绘画', '☕ 咖啡']
]
const personalities = ['INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'INTJ', 'INTP', 'ENTJ', 'ENTP', 'ISFP', 'ISTP', 'ESFP', 'ESTP']
const preferGenders = ['any', 'any', 'any', 'male', 'female'] // 权重偏向any
const preferences = [
  '希望认识有趣的人，一起探索香港',
  '喜欢技术型的人，能一起讨论代码',
  '喜欢拍照和喝咖啡的人',
  '爱运动，阳光型',
  '喜欢安静文艺的人',
  '数据爱好者，喜欢分析',
  '喜欢探索美食和旅行',
  '爱运动，爱唱歌',
  '理性成熟，喜欢烹饪',
  '建筑系学生，喜欢设计',
  '希望找个学霸一起学习',
  '喜欢音乐艺术型的人',
  '找个能一起运动的伙伴',
  '喜欢旅行，想一起去探索世界'
]

const testUsers = []

// 生成100个用户
for (let i = 1; i <= 100; i++) {
  const gender = genders[i % 2]
  const preferGender = preferGenders[i % 5]
  
  testUsers.push({
    id: i.toString(),
    email: `user${i}@connect.hku.hk`,
    password: 'test123',
    surveyCompleted: true,
    survey: {
      avatar: avatars[i % avatars.length],
      gender: gender,
      grade: grades[i % grades.length],
      major: majors[i % majors.length],
      interests: interests[i % interests.length],
      personality: personalities[i % personalities.length],
      preferGender: preferGender,
      preferGrade: [],
      preferAgeMin: '18',
      preferAgeMax: '25',
      preferTraits: [],
      preference: preferences[i % preferences.length]
    }
  })
}

const gradeLabel = (g) => ({ '1': '本科一', '2': '本科二', '3': '本科三', '4': '本科四', '5': '硕士一', '6': '硕士二', '7': '硕士三', '8': '博士' }[g] || g)

const loginAs = async (user) => {
  try {
    // Try to login via API to get the real user with server ID
    const data = await api.login(user.email, user.password)
    if (data.success) {
      localStorage.setItem('hkuuser', JSON.stringify(data.user))
      success.value = `已登录为 ${user.email}！`
      setTimeout(() => router.push('/match'), 500)
    } else {
      // Fallback to local storage
      localStorage.setItem('hkusrs', JSON.stringify(testUsers))
      localStorage.setItem('hkuuser', JSON.stringify(user))
      success.value = `已登录为 ${user.email}（本地模式）`
      setTimeout(() => router.push('/match'), 800)
    }
  } catch (err) {
    // Fallback to local storage
    localStorage.setItem('hkusrs', JSON.stringify(testUsers))
    localStorage.setItem('hkuuser', JSON.stringify(user))
    success.value = `已登录为 ${user.email}（本地模式）`
    setTimeout(() => router.push('/match'), 800)
  }
}
</script>

<style scoped>
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.demo-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.demo-user:hover {
  border-color: var(--primary);
  background: rgba(30, 77, 43, 0.05);
  transform: translateX(4px);
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
</style>
