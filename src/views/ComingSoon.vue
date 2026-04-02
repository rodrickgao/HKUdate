<template>
  <div class="coming-soon">
    <div class="container text-center">
      <div class="coming-icon">🚧</div>
      <h1>即将上线</h1>
      <p>精彩功能正在筹备中，敬请期待！</p>
      <router-link to="/" class="btn btn-primary mt-4">返回首页</router-link>
    </div>
  </div>
</template>

<style scoped>
.coming-soon {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coming-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.coming-soon h1 {
  color: var(--primary);
  margin-bottom: 16px;
}

.coming-soon p {
  color: var(--text-light);
  font-size: 18px;
}
</style>
