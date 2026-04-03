<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">关于 HKU Date</h1>
    </div>
    
    <div class="card" style="max-width: 700px; margin: 0 auto;">
      <div class="about-section">
        <h2>🎓 关于我们</h2>
        <p>HKU Date 是港大校园交友平台，基于16型人格和兴趣爱好为同学们提供智能配对服务。</p>
      </div>
      
      <div class="about-section">
        <h2>🔐 隐私保护</h2>
        <ul>
          <li>仅限 @connect.hku.hk 邮箱注册，确保用户真实性</li>
          <li>用户问卷信息严格保密，仅用于配对算法</li>
          <li>配对成功后，可随时查看对方的邮箱联系方式</li>
          <li>用户可随时删除账户，数据完全清除</li>
        </ul>
      </div>
      
      <div class="about-section">
        <h2>📋 使用流程</h2>
        <ol>
          <li>使用 HKU 邮箱注册账号</li>
          <li>完成邮箱验证</li>
          <li>填写个人问卷（性别、年级、专业、兴趣、人格类型）</li>
          <li>系统智能匹配最合适的同学</li>
          <li>匹配成功后可随时查看对方的邮箱</li>
        </ol>
      </div>
      
      <div class="about-section">
        <h2>📧 联系我们</h2>
        <p>如有问题或建议，请联系：hello@hku.date</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-section {
  margin-bottom: 32px;
}

.about-section h2 {
  color: var(--primary);
  margin-bottom: 12px;
}

.about-section p, .about-section li {
  color: var(--text-light);
  line-height: 1.8;
}

.about-section ol, .about-section ul {
  padding-left: 24px;
}

.about-section li {
  margin-bottom: 8px;
}
</style>
