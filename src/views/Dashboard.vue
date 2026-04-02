<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ t('dashboard.welcome') }}</h1>
      <p class="page-subtitle">{{ user?.email }}</p>
    </div>
    
    <div class="dashboard-grid">
      <div class="card dashboard-card">
        <div class="card-icon">👤</div>
        <h3>{{ t('dashboard.myProfile') }}</h3>
        <p v-if="user?.surveyCompleted">{{ t('dashboard.surveyDone') }}</p>
        <p v-else>{{ t('dashboard.surveyNot') }}</p>
        <router-link to="/profile" class="btn btn-outline">{{ isEnglish ? 'View' : '查看' }}</router-link>
      </div>
      
      <div class="card dashboard-card">
        <div class="card-icon">💕</div>
        <h3>{{ t('dashboard.findMatch') }}</h3>
        <p>{{ isEnglish ? 'View matches' : '查看匹配对象' }}</p>
        <router-link to="/match" class="btn btn-primary">{{ t('dashboard.viewMatch') }}</router-link>
      </div>
      
      <div class="card dashboard-card">
        <div class="card-icon">🔒</div>
        <h3>{{ t('dashboard.privacy') }}</h3>
        <p>{{ isEnglish ? 'Privacy settings' : '管理隐私偏好' }}</p>
        <router-link to="/privacy" class="btn btn-outline">{{ t('dashboard.settings') }}</router-link>
      </div>
      
      <div class="card dashboard-card">
        <div class="card-icon">📝</div>
        <h3>{{ t('dashboard.feedback') }}</h3>
        <p>{{ isEnglish ? 'Share your thoughts' : '告诉我们您的想法' }}</p>
        <router-link to="/feedback" class="btn btn-outline">{{ isEnglish ? 'Feedback' : '反馈' }}</router-link>
      </div>
    </div>
    
    <div class="card mt-4">
      <h3>📅 {{ isEnglish ? 'Email Visibility' : '邮箱可见时间' }}</h3>
      <div class="countdown" v-if="!isTuesdayVisible">
        <p class="countdown-label">{{ t('dashboard.countdown') }}</p>
        <div class="countdown-timer">
          <div class="countdown-item">
            <span class="countdown-num">{{ countdown.days }}</span>
            <span class="countdown-unit">{{ isEnglish ? 'days' : '天' }}</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-num">{{ countdown.hours }}</span>
            <span class="countdown-unit">{{ isEnglish ? 'hrs' : '时' }}</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-num">{{ countdown.minutes }}</span>
            <span class="countdown-unit">{{ isEnglish ? 'min' : '分' }}</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-num">{{ countdown.seconds }}</span>
            <span class="countdown-unit">{{ isEnglish ? 'sec' : '秒' }}</span>
          </div>
        </div>
        <p class="countdown-hint">{{ t('dashboard.locked') }}</p>
      </div>
      <div v-else class="countdown">
        <p class="countdown-active">{{ t('dashboard.active') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'

const i18n = inject('i18n')
const isEnglish = computed(() => i18n.state.lang === 'en')
const t = (key) => i18n.t(key)

const user = ref(JSON.parse(localStorage.getItem('hkuuser') || 'null'))

const getNextTuesday19 = () => {
  const now = new Date()
  const day = now.getDay()
  const tuesday = day === 2 ? now : new Date(now)
  if (day !== 2) {
    tuesday.setDate(now.getDate() + (2 - day + 7) % 7)
  }
  tuesday.setHours(19, 0, 0, 0)
  if (day === 2 && now.getHours() >= 19) {
    tuesday.setDate(tuesday.getDate() + 7)
  }
  return tuesday.getTime()
}

const isTuesdayVisible = computed(() => {
  const now = new Date()
  return now.getDay() === 2 && now.getHours() >= 19 && now.getHours() < 23
})

const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null

const updateCountdown = () => {
  const now = Date.now()
  const target = getNextTuesday19()
  const diff = Math.max(0, target - now)
  
  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.dashboard-card {
  text-align: center;
  padding: 32px 24px;
}

.card-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.dashboard-card h3 {
  color: var(--primary);
  margin-bottom: 8px;
}

.dashboard-card p {
  color: var(--text-light);
  margin-bottom: 16px;
}

.countdown {
  text-align: center;
  padding: 16px;
}

.countdown-label {
  color: var(--text-light);
  margin-bottom: 16px;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.countdown-num {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary);
}

.countdown-unit {
  font-size: 14px;
  color: var(--text-muted);
}

.countdown-hint {
  color: var(--text-muted);
}

.countdown-active {
  color: var(--success);
  font-size: 18px;
  font-weight: 500;
}
</style>
