<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">📜 更新日志</h1>
    </div>
    
    <div class="card" style="max-width: 700px; margin: 0 auto;">
      <div class="changelog-version">
        <h2>v1.0.0 <span class="version-date">2026-04-01</span></h2>
        <ul>
          <li>🎉 初始版本发布</li>
          <li>🔐 HKU 邮箱注册和验证</li>
          <li>📋 用户问卷系统</li>
          <li>💕 智能匹配算法</li>
          <li>🔒 邮箱隐私保护（周二可见）</li>
          <li>👤 用户资料和隐私设置</li>
          <li>🗑️ 账户删除功能</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.changelog-version {
  margin-bottom: 32px;
}

.changelog-version h2 {
  color: var(--primary);
  margin-bottom: 16px;
}

.version-date {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: normal;
}

.changelog-version ul {
  padding-left: 24px;
}

.changelog-version li {
  color: var(--text-light);
  margin-bottom: 8px;
}
</style>
