<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ t('privacy.title') }}</h1>
    </div>
    
    <div class="card" style="max-width: 600px; margin: 0 auto;">
      <div class="privacy-section">
        <h3>📧 {{ t('privacy.email') }}</h3>
        <p class="privacy-desc">{{ t('privacy.emailDesc') }}</p>
        <div class="privacy-status">
          <span v-if="isTuesdayVisible" class="status-active">{{ t('privacy.active') }}</span>
          <span v-else class="status-inactive">{{ t('privacy.inactive') }}</span>
        </div>
      </div>
      
      <div class="privacy-section">
        <h3>👤 {{ t('privacy.profile') }}</h3>
        <p class="privacy-desc">{{ t('privacy.profileDesc') }}</p>
        <label class="checkbox-label">
          <input type="checkbox" v-model="privacy.showProfile" @change="savePrivacy" />
          <span>{{ t('privacy.showProfile') }}</span>
        </label>
      </div>
      
      <div class="privacy-section">
        <h3>🔔 {{ t('privacy.notify') }}</h3>
        <label class="checkbox-label">
          <input type="checkbox" v-model="privacy.emailNotify" @change="savePrivacy" />
          <span>{{ t('privacy.emailNotify') }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject, computed, onMounted } from 'vue'

const i18n = inject('i18n')
const isEnglish = computed(() => i18n.state.lang === 'en')
const t = (key) => i18n.t(key)

const privacy = reactive({
  showProfile: true,
  emailNotify: true
})

const isTuesdayVisible = computed(() => {
  const now = new Date()
  return now.getDay() === 2 && now.getHours() >= 19 && now.getHours() < 23
})

onMounted(() => {
  const saved = localStorage.getItem('hku_privacy')
  if (saved) {
    Object.assign(privacy, JSON.parse(saved))
  }
})

const savePrivacy = () => {
  localStorage.setItem('hku_privacy', JSON.stringify(privacy))
}
</script>

<style scoped>
.privacy-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.privacy-section:last-child {
  border-bottom: none;
}

.privacy-section h3 {
  color: var(--primary);
  margin-bottom: 8px;
}

.privacy-desc {
  color: var(--text-light);
  margin-bottom: 16px;
}

.privacy-status {
  padding: 12px 16px;
  background: var(--bg);
  border-radius: 8px;
}

.status-active {
  color: var(--success);
  font-weight: 500;
}

.status-inactive {
  color: var(--text-muted);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-label input {
  width: 20px;
  height: 20px;
}
</style>
