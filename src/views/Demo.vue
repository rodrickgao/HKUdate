<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">🎭 测试账号登录</h1>
      <p class="page-subtitle">选择一个账号体验完整功能</p>
    </div>
    <div class="card" style="max-width: 600px; margin: 0 auto;">
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

const testUsers = [
  {
    id: '1', email: 'alice@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🦊', gender: 'female', grade: '3', major: '金融学', interests: ['📚 阅读', '🎵 音乐', '✈️ 旅行'], personality: 'ENFP', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '希望认识有趣的人，一起探索香港' }
  },
  {
    id: '2', email: 'brian@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🐯', gender: 'male', grade: '5', major: '计算机科学', interests: ['💻 编程', '🎮 游戏', '🎵 音乐'], personality: 'INTJ', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '喜欢技术型的人，能一起讨论代码' }
  },
  {
    id: '3', email: 'crystal@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🦋', gender: 'female', grade: '2', major: '市场学', interests: ['🎬 影视', '📷 摄影', '☕ 咖啡'], personality: 'ESFJ', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '喜欢拍照和喝咖啡的人' }
  },
  {
    id: '4', email: 'david@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🦁', gender: 'male', grade: '4', major: '工商管理', interests: ['⚽ 足球', '🏀 篮球', '🎵 音乐'], personality: 'ENTJ', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '爱运动，阳光型' }
  },
  {
    id: '5', email: 'emma@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🐱', gender: 'female', grade: '1', major: '心理学', interests: ['📚 阅读', '🧘 瑜伽', '🐱 撸猫'], personality: 'INFP', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '喜欢安静文艺的人' }
  },
  {
    id: '6', email: 'frank@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🐼', gender: 'male', grade: '6', major: '数据科学', interests: ['💻 编程', '📚 阅读', '🎵 音乐'], personality: 'INTP', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '数据爱好者，喜欢分析' }
  },
  {
    id: '7', email: 'grace@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🦄', gender: 'female', grade: '3', major: '经济学', interests: ['📚 阅读', '✈️ 旅行', '🍜 美食'], personality: 'ENFJ', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '喜欢探索美食和旅行' }
  },
  {
    id: '8', email: 'henry@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🐨', gender: 'male', grade: '2', major: '工程学', interests: ['🏃 运动', '🎮 游戏', '🎤 KTV'], personality: 'ESTP', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '爱运动，爱唱歌' }
  },
  {
    id: '9', email: 'iris@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🐸', gender: 'female', grade: '5', major: '法学', interests: ['📚 阅读', '🎬 影视', '🍳 烹饪'], personality: 'INFJ', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '理性成熟，喜欢烹饪' }
  },
  {
    id: '10', email: 'james@connect.hku.hk', password: 'test123', surveyCompleted: true,
    survey: { avatar: '🐯', gender: 'male', grade: '4', major: '建筑学', interests: ['🎨 绘画', '📷 摄影', '✈️ 旅行'], personality: 'ENTP', preferGender: 'any', preferGrade: [], preferAgeMin: '18', preferAgeMax: '25', preferTraits: [], preference: '建筑系学生，喜欢设计' }
  }
]

const gradeLabel = (g) => ({ '1': '本科一', '2': '本科二', '3': '本科三', '4': '本科四', '5': '硕士一', '6': '硕士二', '7': '硕士三', '8': '博士' }[g] || g)

const loginAs = (user) => {
  // Save all test users
  localStorage.setItem('hkusrs', JSON.stringify(testUsers))
  // Set current user
  localStorage.setItem('hkuuser', JSON.stringify(user))
  // Pre-populate matches (everyone matched with alice for demo)
  const matches = testUsers.filter(u => u.id !== user.id).map(u => ({
    id: u.id,
    name: u.email.split('@')[0],
    major: u.survey.major,
    year: gradeLabel(u.survey.grade),
    email: u.email,
    avatar: getAvatarUrl(u.survey.avatar),
    personality: u.survey.personality
  }))
  localStorage.setItem('hku_matches', JSON.stringify(matches))
  success.value = `已登录为 ${user.email}，${matches.length} 个匹配已就绪！`
  setTimeout(() => router.push('/match'), 800)
}

const avatarUrls = {
  '🦊': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  '🐯': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  '🦋': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d40?w=100',
  '🦁': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  '🐱': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
  '🦄': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
  '🐨': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
  '🐸': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
  '🐼': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'
}

const getAvatarUrl = (emoji) => avatarUrls[emoji] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
</script>

<style scoped>
.demo-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.demo-user {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
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
  font-size: 40px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: 50%;
}
.demo-info {
  display: flex;
  flex-direction: column;
}
.demo-info strong {
  font-size: 16px;
  color: var(--primary);
}
.demo-info span {
  font-size: 13px;
  color: var(--gray-600);
}
.demo-personality {
  font-size: 12px !important;
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
