<template>
  <div class="not-found">
    <div class="container text-center">
      <div class="error-icon">😵</div>
      <h1>404</h1>
      <p>页面不存在</p>
      <router-link to="/" class="btn btn-primary mt-4">返回首页</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.not-found h1 {
  color: var(--primary);
  font-size: 72px;
  margin-bottom: 16px;
}

.not-found p {
  color: var(--text-light);
  font-size: 18px;
}
</style>
