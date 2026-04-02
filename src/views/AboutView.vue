<template>
  <div class="page about-page">
    <nav class="nav">
      <div class="container nav-content">
        <router-link to="/" class="nav-brand">HKU Date</router-link>
        <ul class="nav-links">
          <li><router-link to="/about" class="nav-link active">关于</router-link></li>
        </ul>
      </div>
    </nav>

    <main class="about-main">
      <div class="container">
        <div class="about-hero">
          <h1>HKU Date</h1>
          <p class="tagline">寻找属于你的港大缘分</p>
        </div>

        <div class="about-section card">
          <h2>关于我们</h2>
          <p>HKU Date 是香港大学专属的校园交友平台，致力于帮助港大学生找到志同道合的朋友和伴侣。</p>
          <p>我们相信，缘分往往就在校园的某个角落等待被发现。</p>
        </div>

        <div class="about-section card">
          <h2>为什么选择我们？</h2>
          <ul class="feature-list">
            <li><strong>真实可靠</strong> - 仅限香港大学 @hku.hk 邮箱注册</li>
            <li><strong>智能匹配</strong> - 基于兴趣和偏好的智能算法</li>
            <li><strong>隐私保护</strong> - 严格的隐私保护机制</li>
            <li><strong>校园专属</strong> - 只为港大学生服务</li>
          </ul>
        </div>

        <div class="about-section card">
          <h2>联系我们</h2>
          <p>有任何问题或建议？请联系我们：</p>
          <p class="contact-info">📧 hello@hku.date</p>
        </div>

        <div class="about-section card">
          <h2>团队</h2>
          <p>HKU Date 由一群热爱技术的港大学生开发和维护。</p>
        </div>

        <div class="about-footer">
          <p>© 2026 HKU Date. All rights reserved.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--gray-50);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.about-main {
  padding: var(--space-xl) 0;
  max-width: 700px;
  margin: 0 auto;
}

.about-hero {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.about-hero h1 {
  font-size: 3rem;
  margin-bottom: var(--space-sm);
}

.tagline {
  font-size: 1.25rem;
  color: var(--gray-600);
}

.about-section {
  margin-bottom: var(--space-lg);
}

.about-section h2 {
  font-size: 1.25rem;
  margin-bottom: var(--space-md);
}

.about-section p {
  color: var(--gray-700);
  margin-bottom: var(--space-sm);
  line-height: 1.8;
}

.feature-list {
  list-style: none;
}

.feature-list li {
  padding: var(--space-sm) 0;
  color: var(--gray-700);
}

.feature-list strong {
  color: var(--primary);
}

.contact-info {
  font-size: 1.1rem;
  color: var(--primary) !important;
}

.about-footer {
  text-align: center;
  padding: var(--space-xl) 0;
  color: var(--gray-500);
}
</style>
