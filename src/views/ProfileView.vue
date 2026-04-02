<template>
  <div class="page profile-page">
    <nav class="nav">
      <div class="container nav-content">
        <router-link to="/" class="nav-brand">HKU Date</router-link>
        <ul class="nav-links">
          <li><router-link to="/dashboard" class="nav-link">发现</router-link></li>
          <li><router-link to="/match" class="nav-link">匹配</router-link></li>
          <li><router-link to="/profile" class="nav-link active">我的</router-link></li>
        </ul>
      </div>
    </nav>

    <main class="profile-main">
      <div class="container">
        <div class="profile-header card">
          <div class="profile-avatar-large">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" alt="Avatar" />
          </div>
          <h2>Sarah</h2>
          <p>工商管理 · 本科三年级</p>
          <router-link to="/profile/edit" class="btn btn-outline mt-md">编辑资料</router-link>
        </div>

        <div class="profile-section card">
          <h3>自我介绍</h3>
          <p>热爱音乐和旅行，希望认识有趣的人～</p>
        </div>

        <div class="profile-section card">
          <h3>兴趣爱好</h3>
          <div class="tag-grid">
            <span class="tag">音乐</span>
            <span class="tag">旅行</span>
            <span class="tag">美食</span>
            <span class="tag">电影</span>
          </div>
        </div>

        <div class="profile-section card">
          <h3>设置</h3>
          <ul class="settings-list">
            <li><router-link to="/settings/privacy">隐私设置</router-link></li>
            <li><router-link to="/settings/notification">通知设置</router-link></li>
            <li><router-link to="/about">关于 HKU Date</router-link></li>
          </ul>
        </div>

        <button class="btn btn-outline btn-block logout-btn">退出登录</button>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--gray-50);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-main {
  padding: var(--space-xl) 0;
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.profile-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto var(--space-md);
  overflow: hidden;
}

.profile-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-header h2 {
  margin-bottom: var(--space-xs);
}

.profile-header p {
  color: var(--gray-600);
}

.profile-section {
  margin-bottom: var(--space-lg);
}

.profile-section h3 {
  font-size: 1rem;
  margin-bottom: var(--space-md);
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tag {
  background: var(--gray-100);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
}

.settings-list {
  list-style: none;
}

.settings-list li {
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--gray-100);
}

.settings-list li:last-child {
  border-bottom: none;
}

.settings-list a {
  color: var(--gray-700);
  text-decoration: none;
  display: block;
}

.settings-list a:hover {
  color: var(--primary);
}

.logout-btn {
  width: 100%;
  color: var(--error);
  border-color: var(--error);
}

.logout-btn:hover {
  background: var(--error);
  color: white;
}
</style>
