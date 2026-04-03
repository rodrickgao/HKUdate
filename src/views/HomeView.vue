<template>
  <div class="page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">香港大学专属</div>
          <h1>HKU Date</h1>
          <p>寻找属于你的港大缘分</p>
          <p class="hero-sub">仅限 @connect.hku.hk 邮箱注册</p>
          <div class="hero-actions">
            <router-link to="/register" class="btn btn-accent">立即注册</router-link>
            <router-link to="/login" class="btn btn-outline" style="border-color: white; color: white;">登录</router-link>
          </div>
          <div class="demo-action">
            <router-link to="/demo" class="btn btn-demo">🎭 体验测试账号</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="text-center">为什么选择 HKU Date？</h2>
        <div class="grid grid-3 mt-md">
          <div class="card feature-card">
            <div class="feature-icon">🎓</div>
            <h3>专属校园</h3>
            <p>仅限香港大学师生，真实可靠</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">💕</div>
            <h3>智能匹配</h3>
            <p>基于兴趣与偏好的智能算法</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">🔒</div>
            <h3>隐私保护</h3>
            <p>严格的隐私保护机制</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="grid grid-3">
          <div class="stat-item">
            <div class="stat-number">10,000+</div>
            <div class="stat-label">港大学生</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5,000+</div>
            <div class="stat-label">成功匹配</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">甜蜜故事</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container text-center">
        <h2>准备好遇见你的缘分了吗？</h2>
        <p class="mt-md">用你的 @hku.hk 邮箱开始吧</p>
        <router-link to="/register" class="btn btn-accent mt-md">开始寻找</router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>© 2026 HKU Date | 香港大学校园匹配平台</p>
        <p class="mt-md">
          <router-link to="/about">关于</router-link> · 
          <a href="#">隐私政策</a> · 
          <a href="#">使用条款</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/hku-bg.jpg') center/cover no-repeat;
  opacity: 0.15;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  background: var(--accent);
  color: white;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--space-md);
}

.hero h1 {
  font-size: 4rem;
  font-family: var(--font-display);
  margin-bottom: var(--space-md);
  color: white;
}

.hero p {
  font-size: 1.5rem;
  opacity: 0.95;
}

.hero-sub {
  font-size: 1rem !important;
  opacity: 0.8 !important;
  margin-top: var(--space-sm);
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  margin-top: var(--space-xl);
}

.features {
  padding: var(--space-2xl) 0;
  background: var(--white);
}

.features h2 {
  margin-bottom: var(--space-lg);
}

.feature-card {
  text-align: center;
  transition: var(--transition);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.stats {
  padding: var(--space-2xl) 0;
  background: var(--gray-100);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  font-family: var(--font-display);
}

.stat-label {
  color: var(--gray-600);
  margin-top: var(--space-sm);
}

.cta {
  padding: var(--space-2xl) 0;
  background: var(--white);
}

.cta h2 {
  color: var(--primary);
}

.demo-action {
  margin-top: 24px;
  text-align: center;
}

.btn-demo {
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.5);
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-demo:hover {
  background: rgba(255,255,255,0.25);
  border-color: white;
  transform: scale(1.03);
}
</style>
