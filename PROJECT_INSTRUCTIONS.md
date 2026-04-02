# HKU Date 项目完整生成指令

---

## 项目概述

创建一个与 SJTU Date (sjtudate.com) 功能一致的校园交友平台 HKU Date，专为香港大学学生设计。

---

## 技术栈

- **框架**: Vue 3 + Vite
- **路由**: Vue Router
- **样式**: CSS Variables 主题系统
- **部署**: Netlify

---

## 品牌色

| 颜色 | 色值 | 用途 |
|------|------|------|
| 主色 | `#1E4D2B` | HKU Green |
| 强调色 | `#C3A15B` | HKU Gold |
| 白色 | `#ffffff` | 背景/卡片 |
| 灰色 | `#f8f9fa` 到 `#212529` | 文本层次 |

---

## 页面/路由结构 (共14个)

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | HomeView | 首页 Landing (hero, features, stats, CTA) |
| `/login` | LoginView | 登录 |
| `/register` | RegisterView | 注册 (验证 @connect.hku.hk 邮箱) |
| `/verify` | VerifyView | 邮箱验证码验证 (6位验证码) |
| `/survey` | SurveyView | 问卷 (性别、年级、专业、兴趣爱好) |
| `/dashboard` | DashboardView | 发现页面 - 滑动卡片匹配 |
| `/match` | MatchView | 匹配列表 |
| `/profile` | ProfileView | 个人资料 |
| `/privacy` | PrivacyView | 隐私设置 |
| `/about` | AboutView | 关于 |
| `/feedback` | FeedbackView | 反馈 |
| `/report` | ReportView | 举报 |
| `/changelog` | ChangelogView | 更新日志 |
| `/coming-soon` | ComingSoonView | 即将上线 |
| `*` | NotFoundView | 404 |

---

## 核心功能流程

```
1. 首页 → 注册/登录
2. 注册 → 验证 @connect.hku.hk 邮箱
3. 邮箱验证 → 输入6位验证码 (Demo: 123456)
4. 验证成功 → 填写问卷
5. 问卷提交 → Dashboard 滑动匹配
6. 匹配成功 → Match 页面查看
7. Profile 页面 → 编辑资料/隐私设置
```

---

## 【重要】隐私保护机制

### 1. 问卷信息严格保密
- 用户提交问卷后，信息存储在系统中
- 其他用户在浏览卡片时**无法看到**详细信息
- 仅能看到：头像、姓名、年龄、年级、专业、自我介绍、兴趣爱好标签

### 2. 邮箱查看时间限制
- **每周二晚上7点 (19:00) 后**才能查看配对对象的邮箱
- 其他时间显示：`🔒 邮箱将于每周二 19:00 可见`
- 需要实时计算距离下周二 19:00 的倒计时

### 3. 实现要求
- Match 页面顶部显示倒计时组件
- Dashboard 卡片底部显示邮箱隐藏提示
- 每周二 19:00 后自动解锁邮箱显示

---

## 注册限制

- 仅支持 `@connect.hku.hk` 邮箱注册
- 注册时验证邮箱域名

---

## UI/UX 设计参考

### 布局
- 移动端优先设计
- 卡片式展示
- 底部导航栏

### Typography
- 标题: Playfair Display
- 正文: Inter
- 中文: Noto Serif SC

### 组件
- 滑动卡片 (Tinder-style)
- 标签选择器
- 邮箱验证码输入 (6格)

---

## 项目文件结构

```
hku-date/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── style.css
│   ├── router/
│   │   └── index.js
│   └── views/
│       ├── HomeView.vue
│       ├── LoginView.vue
│       ├── RegisterView.vue
│       ├── VerifyView.vue
│       ├── SurveyView.vue
│       ├── DashboardView.vue
│       ├── MatchView.vue
│       ├── ProfileView.vue
│       ├── PrivacyView.vue
│       ├── AboutView.vue
│       ├── FeedbackView.vue
│       ├── ReportView.vue
│       ├── ChangelogView.vue
│       ├── ComingSoonView.vue
│       └── NotFoundView.vue
└── public/
    └── assets/
```

---

## 运行命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 部署到 Netlify
netlify deploy --dir=dist --prod
```

---

## 示例数据 (Demo)

```javascript
// 验证码
const VERIFY_CODE = '123456'

// 匹配用户示例
{
  id: 1,
  name: 'Sarah',
  age: 21,
  year: '本科三年级',
  major: '工商管理',
  email: 'sarah@connect.hku.hk',
  bio: '热爱音乐和旅行，希望认识有趣的人～',
  tags: ['音乐', '旅行', '美食'],
  avatar: 'https://images.unsplash.com/...'
}
```
