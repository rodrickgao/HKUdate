# HKU Date

香港大学校园匹配平台

## 功能

- 🎓 仅限 HKU @hku.hk 邮箱注册
- 💕 智能匹配算法
- 👤 完善的个人资料系统
- 🔒 隐私保护

## 技术栈

- Vue 3 + Vite
- Vue Router
- CSS Variables

## 开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 项目结构

```
hku-date/
├── src/
│   ├── views/       # 页面组件
│   ├── router/      # 路由配置
│   ├── style.css    # 全局样式
│   ├── App.vue      # 根组件
│   └── main.js      # 入口文件
├── index.html
├── vite.config.js
└── package.json
```

## 页面

- `/` - 首页
- `/login` - 登录
- `/register` - 注册
- `/survey` - 问卷
- `/dashboard` - 发现/滑动卡片
- `/match` - 匹配列表
- `/profile` - 个人资料
- `/about` - 关于

## 自定义

修改 `src/style.css` 中的 CSS 变量来调整主题色：

```css
:root {
  --primary: #003366;  /* HKU Blue */
  --accent: #C41E3A;   /* HKU Red */
}
```
