# 🦊 HKU Date - 快速开始指南

## 方式一：在线访问（30秒搞定）

双击运行 `START.bat`
→ 会自动用浏览器打开 https://cute-fudge-83a5a5.netlify.app
→ 密码: `My-Drop-Site`

⚠️ 注意：这种方式没有邮箱验证功能（验证码固定为 `123456` 测试码）

---

## 方式二：本地完整运行（推荐，需要 Node.js）

### 第一次运行
1. 确保已安装 [Node.js v18+](https://nodejs.org)
2. 双击 `run.bat`
3. 等待自动安装依赖并启动

### 每次运行
双击 `run.bat` 即可

### 手动启动（如果 run.bat 有问题）
```bash
# 1. 安装依赖
npm install

# 2. 启动后端（另一个命令行窗口）
node server.js

# 3. 启动前端（第三个命令行窗口）
npm run dev

# 4. 打开 http://localhost:5173
```

---

## 功能说明

| 功能 | 在线版本 | 本地完整版 |
|------|---------|-----------|
| 浏览所有页面 | ✅ | ✅ |
| 注册 / 登录 | ✅ (验证码: 123456) | ✅ (真实邮箱验证码) |
| 16型人格问卷 | ✅ | ✅ |
| 智能匹配 | ✅ | ✅ |
| 隐私设置 | ✅ | ✅ |
| 中英文切换 | ✅ | ✅ |

---

## 端口说明

- **前端**: http://localhost:5173 （Vite 开发服务器）
- **后端 API**: http://localhost:3003 （Express 服务）
- **在线版**: https://cute-fudge-83a5a5.netlify.app （密码: My-Drop-Site）

---

## 技术栈

- 前端: Vue 3 + Vite + Vue Router
- 后端: Express + Nodemailer
- 仅限 @connect.hku.hk 邮箱注册
