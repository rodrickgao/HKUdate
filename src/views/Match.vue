<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">💕 配对结果</h1>
      <p class="page-subtitle">基于您的问卷分析</p>
    </div>
    
    <div v-if="matches.length === 0" class="card text-center">
      <p>暂无匹配结果</p>
      <p class="text-muted">请等待其他用户完成问卷</p>
    </div>
    
    <div v-else class="matches-grid">
      <div v-for="match in matches" :key="match.id" class="card match-card">
        <div class="match-header">
          <div class="match-avatar">{{ match.survey?.avatar || '👤' }}</div>
          <div class="match-info">
            <h3>{{ match.survey?.major }} @{{ match.survey?.grade }}年级</h3>
            <p class="match-personality" v-if="match.survey?.personality">
              {{ match.survey.personality }} - {{ getPersonalityDesc(match.survey.personality) }}
            </p>
          </div>
        </div>
        
        <div class="match-details">
          <div class="match-section">
            <h4>🎯 兴趣爱好</h4>
            <p>{{ match.survey?.interests }}</p>
          </div>
          <div class="match-section">
            <h4>💭 TA期望</h4>
            <p>{{ match.survey?.preference }}</p>
          </div>
        </div>
        
        <div class="match-email">
          <template v-if="isTuesdayVisible">
            <p class="email-label">📧 邮箱</p>
            <p class="email-value">{{ match.email }}</p>
          </template>
          <template v-else>
            <p class="email-locked">🔒 邮箱将于每周二 19:00 可见</p>
            <p class="countdown-hint">距离可见还有：{{ getTimeUntilTuesday() }}</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const currentUser = ref(JSON.parse(localStorage.getItem('hkuuser') || 'null'))

const personalityDesc = {
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '物流师', ISFJ: '守卫者', ESTJ: '总经理', ESFJ: '执政官',
  INTJ: '建筑师', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
  ISFP: '探险家', ISTP: '鉴赏家', ESFP: '表演者', ESTP: '企业家'
}

const getPersonalityDesc = (type) => personalityDesc[type] || ''

const isTuesdayVisible = computed(() => {
  const now = new Date()
  return now.getDay() === 2 && now.getHours() >= 19 && now.getHours() < 23
})

const getTimeUntilTuesday = () => {
  const now = new Date()
  const day = now.getDay()
  const daysUntil = (2 - day + 7) % 7 || 7
  const hours = 19 - now.getHours()
  return `${daysUntil}天 ${hours}小时`
}

const matches = ref([])

const calculateMatch = (user1, user2) => {
  let score = 0
  if (user1.survey.gender === user2.survey.preference?.gender) score += 30
  if (user1.survey.personality && user2.survey.personality) score += 20
  if (user1.survey.major === user2.survey.major) score += 15
  if (user1.survey.grade === user2.survey.grade) score += 10
  return score
}

onMounted(() => {
  const users = JSON.parse(localStorage.getItem('hkusrs') || '[]')
  const otherUsers = users.filter(u => u.id !== currentUser.value?.id && u.surveyCompleted)
  
  // Calculate matches
  const scored = otherUsers.map(u => ({
    ...u,
    matchScore: calculateMatch(currentUser.value, u)
  })).sort((a, b) => b.matchScore - a.matchScore)
  
  matches.value = scored.slice(0, 10)
})
</script>

<style scoped>
.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.match-card {
  padding: 24px;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.match-avatar {
  font-size: 48px;
}

.match-info h3 {
  color: var(--primary);
  margin-bottom: 4px;
}

.match-personality {
  color: var(--accent);
  font-size: 14px;
}

.match-details {
  margin-bottom: 16px;
}

.match-section {
  margin-bottom: 12px;
}

.match-section h4 {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 4px;
}

.match-section p {
  color: var(--text);
}

.match-email {
  background: var(--bg);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.email-label {
  font-size: 14px;
  color: var(--text-light);
}

.email-value {
  color: var(--primary);
  font-weight: 500;
}

.email-locked {
  color: var(--text-muted);
}

.countdown-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.text-muted {
  color: var(--text-muted);
}
</style>
