<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">💕 我的配对</h1>
      <p class="page-subtitle" v-if="loading">正在查找匹配...</p>
      <p class="page-subtitle" v-else-if="matchData?.isMatched">匹配成功！</p>
      <p class="page-subtitle" v-else>等待下一轮配对</p>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="card text-center loading-card">
      <div class="loading-spinner">💕</div>
      <p>正在为您寻找最佳匹配...</p>
    </div>
    
    <!-- 已匹配状态 -->
    <div v-else-if="matchData?.isMatched" class="match-success">
      <div class="success-header">
        <div class="celebration">🎉</div>
        <h2>恭喜！您已匹配到最佳对象</h2>
      </div>
      
      <div class="card match-card">
        <div class="match-header">
          <div class="match-avatar">{{ matchData.theirInfo?.avatar || '👤' }}</div>
          <div class="match-info">
            <h3>{{ matchData.theirInfo?.major }} @ {{ gradeLabel(matchData.theirInfo?.grade) }}</h3>
            <p class="match-personality" v-if="matchData.theirInfo?.personality">
              {{ matchData.theirInfo.personality }} - {{ getPersonalityDesc(matchData.theirInfo.personality) }}
            </p>
          </div>
        </div>
        
        <div class="match-details">
          <div class="match-section">
            <h4>🎯 兴趣爱好</h4>
            <p>{{ matchData.theirInfo?.interests?.join(' ') || '未填写' }}</p>
          </div>
          <div class="match-section">
            <h4>💭 TA的期望</h4>
            <p>{{ matchData.theirInfo?.preference || '未填写' }}</p>
          </div>
        </div>
        
        <div class="match-score">
          <span class="score-label">匹配指数：</span>
          <span class="score-value">{{ matchData.matchScore }}分</span>
        </div>
        
        <div class="match-email">
          <template v-if="isTuesdayVisible">
            <p class="email-label">📧 对方邮箱</p>
            <p class="email-value">{{ matchData.theirEmail }}</p>
          </template>
          <template v-else>
            <p class="email-locked">🔒 邮箱将于每周二 19:00 - 23:00 可见</p>
            <p class="countdown-hint">距离可见还有：{{ getTimeUntilTuesday() }}</p>
          </template>
        </div>
      </div>
      
      <div class="match-hint">
        <p>💡 配对结果仅显示一次，请珍惜您的匹配对象！</p>
      </div>
    </div>
    
    <!-- 未匹配状态 -->
    <div v-else class="card text-center waiting-card">
      <div class="waiting-icon">⏳</div>
      <h2>暂未匹配到合适的对象</h2>
      <p class="waiting-message">{{ matchData?.message || '请等待下一轮配对' }}</p>
      
      <div class="stats-card">
        <h4>📊 当前统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-num">{{ statsData?.completedSurveyUsers || 0 }}</span>
            <span class="stat-label">已完成问卷</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ statsData?.latestRoundStats?.matchedPairs || 0 }}</span>
            <span class="stat-label">已配对人数</span>
          </div>
        </div>
        <p class="last-match" v-if="statsData?.lastMatchTime">
          上次配对时间：{{ formatDate(statsData.lastMatchTime) }}
        </p>
      </div>
      
      <div class="waiting-actions">
        <button @click="refreshMatch" class="btn btn-outline" :disabled="loading">
          🔄 刷新状态
        </button>
        <router-link to="/profile" class="btn btn-primary">
          ✏️ 编辑问卷提高匹配率
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api.js'

const currentUser = ref(JSON.parse(localStorage.getItem('hkuuser') || 'null'))
const loading = ref(true)
const matchData = ref(null)
const statsData = ref(null)

const personalityDesc = {
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '物流师', ISFJ: '守卫者', ESTJ: '总经理', ESFJ: '执政官',
  INTJ: '建筑师', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
  ISFP: '探险家', ISTP: '鉴赏家', ESFP: '表演者', ESTP: '企业家'
}

const gradeLabel = (g) => {
  const labels = { '1': '本科一', '2': '本科二', '3': '本科三', '4': '本科四', '5': '硕士一', '6': '硕士二', '7': '硕士三+', '8': '博士' }
  return labels[g] || g
}

const getPersonalityDesc = (type) => personalityDesc[type] || ''

const isTuesdayVisible = () => {
  const now = new Date()
  return now.getDay() === 2 && now.getHours() >= 19 && now.getHours() < 23
}

const getTimeUntilTuesday = () => {
  const now = new Date()
  const day = now.getDay()
  const daysUntil = (2 - day + 7) % 7 || 7
  const hours = 19 - now.getHours()
  return `${daysUntil}天 ${hours}小时`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const fetchMatch = async () => {
  if (!currentUser.value?.id) {
    matchData.value = { isMatched: false, message: '请先登录' }
    return
  }
  
  try {
    const data = await api.getMyMatch(currentUser.value.id)
    if (data.success) {
      matchData.value = data
    } else {
      matchData.value = { isMatched: false, message: '获取匹配信息失败' }
    }
  } catch (err) {
    matchData.value = { isMatched: false, message: '网络错误，请稍后重试' }
  }
}

const fetchStats = async () => {
  try {
    const data = await api.getMatchStats()
    if (data.success) {
      statsData.value = data
    }
  } catch (err) {
    // ignore
  }
}

const refreshMatch = async () => {
  loading.value = true
  await fetchMatch()
  await fetchStats()
  loading.value = false
}

onMounted(async () => {
  await fetchMatch()
  await fetchStats()
  loading.value = false
})
</script>

<style scoped>
.loading-card {
  padding: 48px;
}

.loading-spinner {
  font-size: 48px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.match-success {
  max-width: 600px;
  margin: 0 auto;
}

.success-header {
  text-align: center;
  margin-bottom: 24px;
}

.celebration {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-header h2 {
  color: var(--primary);
  font-size: 24px;
}

.match-card {
  padding: 24px;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.match-avatar {
  font-size: 64px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  border-radius: 50%;
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

.match-score {
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 16px;
}

.score-label {
  opacity: 0.9;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  margin-left: 8px;
}

.match-email {
  background: var(--bg);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.email-label {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 4px;
}

.email-value {
  color: var(--primary);
  font-weight: 500;
  font-size: 16px;
}

.email-locked {
  color: var(--text-muted);
}

.countdown-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.match-hint {
  text-align: center;
  margin-top: 16px;
}

.match-hint p {
  color: var(--text-light);
  font-size: 14px;
}

.waiting-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 48px 32px;
}

.waiting-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.waiting-card h2 {
  color: var(--primary);
  margin-bottom: 8px;
}

.waiting-message {
  color: var(--text-light);
  margin-bottom: 32px;
}

.stats-card {
  background: var(--bg);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.stats-card h4 {
  color: var(--text-light);
  margin-bottom: 16px;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: var(--primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.last-match {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.waiting-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.waiting-actions .btn {
  width: 100%;
}
</style>
