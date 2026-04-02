<template>
  <div class="page match-page">
    <nav class="nav">
      <div class="container nav-content">
        <router-link to="/" class="nav-brand">HKU Date</router-link>
        <ul class="nav-links">
          <li><router-link to="/dashboard" class="nav-link">发现</router-link></li>
          <li><router-link to="/match" class="nav-link active">匹配</router-link></li>
          <li><router-link to="/profile" class="nav-link">我的</router-link></li>
        </ul>
      </div>
    </nav>

    <main class="match-main">
      <div class="container">
        <h2 class="text-center">你的匹配</h2>
        
        <!-- Email reveal notice -->
        <div class="email-notice">
          <span class="notice-icon">📧</span>
          <div class="notice-content">
            <strong>邮箱查看时间</strong>
            <p>每周二 19:00 开放查看对方邮箱</p>
          </div>
          <div class="next-reveal" v-if="!isTuesday7pm">
            <span class="countdown">距离开放还有：{{ timeUntilReveal }}</span>
          </div>
          <div class="revealed" v-else>
            <span class="revealed-badge">✅ 已开放</span>
          </div>
        </div>
        
        <div class="match-list" v-if="matches.length">
          <div class="match-card card" v-for="match in matches" :key="match.id">
            <img :src="match.avatar" :alt="match.name" class="match-avatar" />
            <div class="match-info">
              <h3>{{ match.name }}</h3>
              <p>{{ match.major }} · {{ match.year }}</p>
              <!-- Email (only shown on Tuesday 7pm) -->
              <p class="match-email" v-if="isTuesday7pm">
                📧 {{ match.email }}
              </p>
              <p class="match-email-hidden" v-else>
                🔒 邮箱将于每周二 19:00 可见
              </p>
            </div>
            <button class="btn btn-primary btn-sm" @click="chat(match)">聊天</button>
          </div>
        </div>

        <div class="empty-state" v-else>
          <div class="empty-icon">💕</div>
          <h3>还没有匹配</h3>
          <p>去发现页面多认识一些新朋友吧</p>
          <router-link to="/dashboard" class="btn btn-primary">去发现</router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const matches = ref([
  { id: 1, name: 'Sarah', major: '工商管理', year: '本科三年级', email: 'sarah@connect.hku.hk', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: 2, name: 'Emily', major: '金融学', year: '硕士一年级', email: 'emily@connect.hku.hk', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d40?w=100' }
])

// Check if it's Tuesday 7pm+
const now = ref(new Date())
let timer = null

const isTuesday7pm = computed(() => {
  const date = now.value
  const day = date.getDay() // 0=Sun, 1=Mon, 2=Tue...
  const hours = date.getHours()
  return day === 2 && hours >= 19
})

const timeUntilReveal = computed(() => {
  const date = new Date(now.value)
  let nextTuesday = new Date(date)
  
  // Find next Tuesday
  const day = date.getDay()
  const daysUntilTuesday = day === 2 ? 7 : (2 - day + 7) % 7 || 7
  nextTuesday.setDate(date.getDate() + daysUntilTuesday)
  nextTuesday.setHours(19, 0, 0, 0)
  
  if (day === 2 && date.getHours() >= 19) {
    return '已开放'
  }
  
  const diff = nextTuesday - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${daysUntilTuesday}天 ${hours}小时 ${minutes}分钟`
})

const chat = (match) => {
  alert(`正在打开与 ${match.name} 的聊天...`)
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000) // Update every minute
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.match-page {
  min-height: 100vh;
  background: var(--gray-50);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-main {
  padding: var(--space-xl) 0;
  max-width: 600px;
  margin: 0 auto;
}

.match-main h2 {
  margin-bottom: var(--space-lg);
}

.email-notice {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: var(--white);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-xl);
}

.notice-icon {
  font-size: 2rem;
}

.notice-content {
  flex: 1;
}

.notice-content strong {
  display: block;
  color: var(--primary);
  margin-bottom: var(--space-xs);
}

.notice-content p {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
}

.next-reveal {
  text-align: right;
}

.countdown {
  font-size: 0.75rem;
  color: var(--gray-500);
  background: var(--gray-100);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.revealed-badge {
  background: var(--success);
  color: white;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.match-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.match-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.match-info {
  flex: 1;
}

.match-info h3 {
  font-size: 1.1rem;
  margin-bottom: var(--space-xs);
}

.match-info p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.match-email {
  color: var(--primary) !important;
  font-weight: 500;
}

.match-email-hidden {
  font-size: 0.75rem !important;
  color: var(--gray-500) !important;
  font-style: italic;
}

.btn-sm {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
}

.empty-state h3 {
  margin-bottom: var(--space-sm);
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: var(--space-lg);
}
</style>
