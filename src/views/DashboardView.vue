<template>
  <div class="page dashboard-page">
    <!-- Navigation -->
    <nav class="nav">
      <div class="container nav-content">
        <router-link to="/" class="nav-brand">HKU Date</router-link>
        <ul class="nav-links">
          <li><router-link to="/dashboard" class="nav-link active">发现</router-link></li>
          <li><router-link to="/match" class="nav-link">匹配</router-link></li>
          <li><router-link to="/profile" class="nav-link">我的</router-link></li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="container">
        <div class="dashboard-header">
          <h2>发现新朋友</h2>
          <p>向左滑过，向右喜欢</p>
          
          <!-- Privacy Notice -->
          <div class="privacy-notice">
            <span class="privacy-icon">🔒</span>
            <span>每周二晚上7点开放查看对方邮箱</span>
          </div>
        </div>

        <!-- Card Stack -->
        <div class="card-stack">
          <div class="profile-card card" v-for="(user, index) in profiles" :key="user.id" :style="{ zIndex: profiles.length - index }">
            <div class="profile-image">
              <img :src="user.avatar" :alt="user.name" />
            </div>
            <div class="profile-info">
              <h3>{{ user.name }}, {{ user.age }}</h3>
              <p class="profile-meta">{{ user.year }} · {{ user.major }}</p>
              <p class="profile-bio">{{ user.bio }}</p>
              <div class="profile-tags">
                <span v-for="tag in user.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              
              <!-- Email hidden notice -->
              <div class="email-hidden-notice">
                <span>📧 对方邮箱将在每周二 19:00 后可见</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button class="action-btn pass" @click="pass">✕</button>
          <button class="action-btn like" @click="like">♥</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const profiles = ref([
  {
    id: 1,
    name: 'Sarah',
    age: 21,
    year: '本科三年级',
    major: '工商管理',
    bio: '热爱音乐和旅行，希望认识有趣的人～',
    tags: ['音乐', '旅行', '美食'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
  },
  {
    id: 2,
    name: 'Emily',
    age: 22,
    year: '硕士一年级',
    major: '金融学',
    bio: '健身爱好者，喜欢探索香港的美食店',
    tags: ['健身', '美食', '电影'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d40?w=400'
  }
])

const pass = () => {
  profiles.value.pop()
}

const like = () => {
  profiles.value.pop()
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--gray-50);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-main {
  padding: var(--space-xl) 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.privacy-notice {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  background: rgba(0, 51, 102, 0.1);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  margin-top: var(--space-md);
  font-size: 0.875rem;
  color: var(--primary);
}

.card-stack {
  position: relative;
  max-width: 360px;
  height: 520px;
  margin: 0 auto;
}

.profile-card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.profile-card:first-child {
  transform: scale(0.95);
  opacity: 0.8;
}

.profile-image {
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  padding: var(--space-md);
}

.profile-info h3 {
  font-size: 1.25rem;
  margin-bottom: var(--space-xs);
}

.profile-meta {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: var(--space-sm);
}

.profile-bio {
  color: var(--gray-700);
  font-size: 0.875rem;
  margin-bottom: var(--space-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tag {
  background: var(--gray-100);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--gray-600);
}

.email-hidden-notice {
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background: var(--gray-100);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 0.75rem;
  color: var(--gray-600);
}

.card-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin-top: var(--space-xl);
}

.action-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.pass {
  background: var(--white);
  color: var(--error);
  box-shadow: var(--shadow-md);
}

.action-btn.pass:hover {
  background: var(--error);
  color: white;
  transform: scale(1.1);
}

.action-btn.like {
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-md);
}

.action-btn.like:hover {
  transform: scale(1.1);
}
</style>
