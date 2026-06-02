# Digital Frame - iPad 电子相框

> 将闲置的初代 iPad 改造成一个精美的电子相框，支持照片轮播、实时时钟、天气显示。
> 照片存储在群晖 NAS 上，服务通过 Docker 部署在群晖 DS1520+ 上。

![version](https://img.shields.io/badge/version-v0.2.0-blue)
![platform](https://img.shields.io/badge/platform-iPad%20%7C%20NAS-brightgreen)

---

## ✨ 功能特性

- **📸 照片轮播** — 从 NAS 读取照片，自动轮播，支持递归遍历子目录
- **⏰ 实时时钟** — 显示年月日、星期、时分秒
- **🌤️ 实时天气** — 通过和风天气 API 显示温度、天气状况、风力
- **◀ ▶ 手动切换** — 支持上一张/下一张按钮，手动切换后暂停自动轮播 10 秒
- **📱 适配初代 iPad** — 1024×768 全屏显示，触摸优化
- **🐳 Docker 部署** — 一键部署到群晖 NAS

## 🏗️ 项目结构

```
digital_frame/
├── README.md              # 项目说明（本文件）
├── CHANGELOG.md           # 版本变更记录
├── VERSION                # 当前版本号
├── docker-compose.yml     # Docker 编排文件
├── .gitignore             # Git 忽略规则
│
├── frontend/              # 前端代码
│   ├── index.html         # 主页面
│   ├── css/style.css      # 自定义样式
│   └── js/                # JavaScript 模块
│       ├── config.js      # 前端配置
│       ├── clock.js       # 时钟模块
│       ├── slideshow.js   # 图片轮播模块
│       └── weather.js     # 天气模块
│
├── server/                # 后端服务 (Node.js + Express)
│   ├── Dockerfile         # Docker 构建文件
│   ├── .env.example       # 环境变量模板
│   ├── package.json
│   └── src/
│       ├── index.js       # 服务入口
│       ├── config.js      # 服务端配置
│       └── routes/
│           ├── photos.js  # 照片 API
│           └── weather.js # 天气代理 API
│
├── nginx/                 # Nginx 配置
│   └── default.conf
│
└── docs/                  # 文档
    ├── 01_PRD.md          # 产品需求文档
    ├── 02_SDD.md          # 概要设计文档
    ├── 03_API.md          # API 接口文档
    └── 04_DEPLOY.md       # 部署指南
```

## 🚀 快速部署

### 在群晖 NAS 上部署

```bash
# 1. SSH 连接到群晖
ssh 用户名@群晖IP

# 2. 拉取代码
cd /volume1/docker
git clone https://github.com/erichucci/digital_frame.git
cd digital_frame

# 3. 配置环境变量
cp server/.env.example server/.env
vi server/.env
# 填入 QWEATHER_API_KEY 和 QWEATHER_LOCATION_ID

# 4. 修改照片目录路径
vi docker-compose.yml
# 将 /volume4/photo 改为你 NAS 上的实际照片路径

# 5. 启动服务
docker-compose up -d
```

### 本地开发测试

```bash
cd server
npm install
cp .env.example .env
# 编辑 .env 填入 API Key
NODE_ENV=development node src/index.js
# 浏览器访问 http://localhost:3000
```

> 详细部署步骤请参考 [docs/04_DEPLOY.md](docs/04_DEPLOY.md)

## 📖 文档

| 文档 | 说明 |
|------|------|
| [产品需求文档](docs/01_PRD.md) | 功能需求、非功能需求、输入输出规则 |
| [概要设计文档](docs/02_SDD.md) | 架构设计、模块划分、技术选型 |
| [API 接口文档](docs/03_API.md) | 照片 API、天气 API、健康检查 |
| [部署指南](docs/04_DEPLOY.md) | 群晖 Docker 部署、iPad 配置 |

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + JavaScript + Tailwind CSS |
| 后端 | Node.js + Express |
| 天气 | 和风天气 API (QWeather) |
| 容器化 | Docker + Docker Compose |
| 反向代理 | Nginx |
| 存储 | 群晖 NAS (NFS/SMB 挂载) |

## 📋 版本历史

- **v0.2.0** — 递归遍历子目录、手动切换按钮、天气 API 专属域名支持
- **v0.1.0** — 初始版本：照片轮播、时钟、天气、Docker 部署

详见 [CHANGELOG.md](CHANGELOG.md)

## 📄 许可

MIT License
