<template>
  <div class="home-page">
    <div class="lang-toggle">
      <button @click="toggleLang" class="lang-btn">
        {{ isEnglish ? '中文' : 'EN' }}
      </button>
    </div>
    <div class="hero">
      <div class="container">
        <h1 class="hero-title">{{ t('home.title') }}</h1>
        <p class="hero-subtitle">{{ t('home.subtitle') }}</p>
        <p class="hero-desc">{{ t('home.desc') }}</p>
        <div class="hero-actions">
          <router-link to="/register" class="btn btn-accent">{{ t('home.signup') }}</router-link>
          <router-link to="/login" class="btn btn-outline">{{ t('home.login') }}</router-link>
        </div>
      </div>
    </div>
    <div class="features container">
      <div class="feature-card card">
        <div class="feature-icon">🔐</div>
        <h3>{{ t('home.feature.verify') }}</h3>
        <p>{{ t('home.feature.verify.desc') }}</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">🧠</div>
        <h3>{{ t('home.feature.match') }}</h3>
        <p>{{ t('home.feature.match.desc') }}</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">🔒</div>
        <h3>{{ t('home.feature.privacy') }}</h3>
        <p>{{ t('home.feature.privacy.desc') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'

const i18n = inject('i18n')
const isEnglish = computed(() => i18n.state.lang === 'en')
const t = (key) => i18n.t(key)

const toggleLang = () => {
  i18n.setLang(isEnglish.value ? 'zh' : 'en')
}
</script>

<style scoped>
.lang-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.lang-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  border: 2px solid white;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: white;
  color: var(--primary);
}

.hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--accent);
}

.hero-desc {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.hero-actions .btn-outline {
  border-color: white;
  color: white;
}

.hero-actions .btn-outline:hover {
  background: white;
  color: var(--primary);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: -40px;
  position: relative;
  z-index: 1;
}

.feature-card {
  text-align: center;
  padding: 32px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  color: var(--primary);
  margin-bottom: 8px;
}

.feature-card p {
  color: var(--text-light);
}
</style>
