# HKU Date 🎓

港大校园交友平台 - 基于性格匹配的智能校园交友系统

## 功能特点

- 🔐 仅限 @connect.hku.hk 邮箱注册
- 📧 6位邮箱验证码验证
- 🧠 16型人格问卷 + 智能匹配算法
- 🔒 隐私保护（每周二 7pm 后可见邮箱）
- 🌍 中英文双语支持
- 💾 自动登录 + 资料记忆功能

## 快速开始

### 方式一：Windows 一键运行（推荐）

1. 克隆或下载项目
2. 解压后双击 `run.bat`
3. 等待自动安装依赖并启动

### 方式二：手动运行

```bash
# 1. 克隆项目
git clone https://github.com/rodrickgao/HKUdate.git
cd HKUdate

# 2. 安装依赖
npm install

# 3. 启动后端（端口 3003）
node server.js

# 4. 启动前端（端口 5173）
npm run dev
```

打开浏览器访问：http://localhost:5173

## 技术栈

- **前端**: Vue 3 + Vite + Vue Router
- **后端**: Express + Nodemailer
- **存储**: localStorage (浏览器本地)
- **样式**: CSS Variables 主题系统

## 项目结构

```
hku-date/
├── src/                 # Vue 前端源码
│   ├── views/           # 页面组件
│   ├── App.vue         # 主应用
│   └── main.js         # 入口文件
├── server.js           # Express 后端
├── run.bat             # Windows 一键运行
└── package.json        # 项目配置
```

## 注意事项

1. 需要 Node.js (v18+) 环境
2. 邮件发送功能需要配置 Gmail SMTP（开发模式可跳过）
3. 仅供港大学生使用

## License

MIT