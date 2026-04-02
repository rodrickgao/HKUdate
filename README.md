# HKU Date 🎓

港大校园交友平台 - 基于性格匹配的智能校园交友系统

## 🌐 在线访问 & 下载

**前端网站（需密码）：**
- **https://cute-fudge-83a5a5.netlify.app**
- 密码: `My-Drop-Site`

**完整源码下载（推荐 - 无需密码）：**
- **https://github.com/rodrickgao/HKUdate/raw/main/HKUdate-v1.0.zip**
- 或访问 GitHub 仓库主页 → 点击 HKUdate-v1.0.zip → Download

> ⚠️ 注意：在线版本无后端服务，邮箱验证功能需要下载完整版本地运行。

## 功能特点

- 🔐 仅限 @connect.hku.hk 邮箱注册
- 📧 6位邮箱验证码验证（需本地运行）
- 🧠 16型人格问卷 + 智能匹配算法
- 🔒 隐私保护（每周二 7pm 后可见邮箱）
- 🌍 中英文双语支持
- 💾 自动登录 + 资料记忆功能

## 如何使用

### 方式一：在线访问（需密码）
打开上方链接，输入密码 `My-Drop-Site`

### 方式二：本地运行完整功能（推荐）

```bash
# 克隆项目
git clone https://github.com/rodrickgao/HKUdate.git
cd HKUdate

# 安装依赖
npm install

# 启动后端（端口 3003）
node server.js

# 启动前端（端口 5173）
npm run dev
```

打开浏览器访问：http://localhost:5173

### 方式三：Windows 一键运行
下载项目后，双击 `run.bat`

## 技术栈

- **前端**: Vue 3 + Vite + Vue Router
- **后端**: Express + Nodemailer (本地运行)
- **托管**: Netlify (在线前端)
- **存储**: localStorage (浏览器本地)

## 注意事项

1. 在线版本无后端服务，邮箱验证功能不可用
2. 完整功能需要在本地运行
3. 需要 Node.js (v18+) 环境
4. 仅供港大学生使用

## License

MIT