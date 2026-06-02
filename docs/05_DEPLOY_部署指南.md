# Digital Frame 部署指南

## 群晖 DS1520+ Docker 部署

---

## 一、准备工作

### 1.1 申请和风天气 API Key

1. 访问 [和风天气开发平台](https://dev.qweather.com)
2. 点击「注册」创建账号
3. 登录后进入「控制台」→「应用管理」
4. 点击「创建应用」
   - 应用名称：`Digital Frame`（随意）
   - 选择「免费订阅」（免费版每天 1000 次调用，完全够用）
5. 创建成功后，复制你的 **API Key**（一串字符，如 `1234567890abcdef`）

### 1.2 查找你所在城市的 Location ID

1. 访问 [和风天气城市列表](https://github.com/qwd/LocationList)
2. 搜索你所在的城市
3. 记录对应的 Location ID（如北京为 `101010100`）

---

## 二、配置项目

### 2.1 配置环境变量

在 `server/` 目录下创建 `.env` 文件：

```bash
cd /path/to/digital_frame/server
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```ini
# 和风天气 API Key（必填）
QWEATHER_API_KEY=你申请的API_KEY

# 你所在城市的 Location ID
QWEATHER_LOCATION_ID=101010100
```

### 2.2 确认照片目录路径

检查 `docker-compose.yml` 中的 volumes 配置：

```yaml
volumes:
  - /volume4/photo:/data/photos:ro
```

- **左侧** `/volume4/photo`：你的 NAS 实际照片路径
- **右侧** `/data/photos`：容器内路径（不要修改）
- **`:ro`**：只读挂载，防止容器误删照片

如果你的照片在 NAS 的其他路径，请修改左侧路径。

---

## 三、部署到群晖

### 方法一：通过 git clone 部署（推荐）

> **为什么推荐这个方法？**
> 项目中的 `.env`、`.env.example`、`.gitignore` 等文件以 `.` 开头，在 macOS Finder 和群晖 File Station 中默认**隐藏不显示**。
> 用 `git clone` 可以确保所有文件（包括隐藏文件）完整无误地拷贝到 NAS 上。

#### 3.1 在群晖上通过 SSH 拉取代码

1. 群晖开启 SSH（控制面板 → 终端机和 SNMP → 启动 SSH）
2. 使用 SSH 连接到群晖：
   ```bash
   ssh 你的用户名@群晖IP地址
   ```
3. 拉取代码：
   ```bash
   cd /volume1/docker
   git clone https://github.com/erichucci/digital_frame.git
   cd digital_frame
   ```
4. 配置 `.env` 文件：
   ```bash
   cp server/.env.example server/.env
   vi server/.env
   # 填入 QWEATHER_API_KEY 和 QWEATHER_LOCATION_ID
   ```
5. 修改照片目录路径（编辑 `docker-compose.yml`）：
   ```bash
   vi docker-compose.yml
   # 将 /volume4/photo 改为你 NAS 上的实际照片路径
   ```
6. 启动服务：
   ```bash
   docker-compose up -d
   ```

### 方法二：通过 File Station 手动上传

> ⚠️ **注意**：`.env` 和 `.env.example` 是隐藏文件（以 `.` 开头），
> 在 macOS Finder 中按 `Cmd + Shift + .` 才能看到，在群晖 File Station 中需开启「显示隐藏文件」。
> **建议用下面的 tar 打包方式，避免遗漏隐藏文件。**

#### 3.2a 在 Mac 上打包（推荐，保留隐藏文件）

```bash
# 在 Mac 上打包整个项目（tar 会包含所有隐藏文件）
cd /Users/erich/loseric
tar czf digital_frame.tar.gz digital_frame

# 然后通过 File Station 将 digital_frame.tar.gz 上传到群晖的 /docker/ 目录
```

#### 3.2b 在群晖上解压

通过 SSH 连接到群晖后执行：

```bash
cd /volume1/docker
tar xzf digital_frame.tar.gz
cd digital_frame
```

#### 3.2c 配置并启动

```bash
# 创建 .env 文件
cp server/.env.example server/.env
vi server/.env
# 填入 QWEATHER_API_KEY 和 QWEATHER_LOCATION_ID

# 修改照片目录路径
vi docker-compose.yml
# 将 /volume4/photo 改为你 NAS 上的实际照片路径

# 启动服务
docker-compose up -d
```

### 方法三：通过群晖 Docker 套件（图形界面）

1. 打开 **Docker** 套件
2. 进入 **项目** 标签页
3. 点击 **新增**
4. 选择 **docker-compose.yml** 文件所在目录
5. 设置项目名称：`digital_frame`
6. 点击 **应用** 并等待构建完成

#### 3.4 验证部署

1. 在浏览器中访问：`http://群晖IP:8080`
2. 应该能看到电子相框页面
3. 检查 API 是否正常：`http://群晖IP:8080/api/health`
   - 应返回 JSON：`{"status":"ok","version":"0.2.0",...}`

---

## 附：本地开发测试（Mac/Linux）

如果你在 Mac 上开发，也可以先在本地测试：

```bash
# 1. 安装依赖
cd server
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API Key

# 3. 开发模式启动（同时提供前端静态文件）
NODE_ENV=development node src/index.js

# 4. 浏览器访问
open http://localhost:3000
```

---

## 四、iPad 访问设置

### 4.1 获取访问地址

1. 在群晖上查看 IP 地址：
   - 控制面板 → 网络 → 网络界面
   - 记录 LAN 口的 IP（如 `192.168.1.100`）
2. 访问地址：`http://192.168.1.100:8080`

### 4.2 在 iPad 上设置

1. 打开 Safari 浏览器
2. 访问 `http://192.168.1.100:8080`
3. 点击「分享」按钮 → 「添加到主屏幕」
4. 命名为「电子相框」
5. 从主屏幕打开，即可全屏运行

### 4.3 设置常亮显示

在 iPad 的 **设置 → 显示与亮度 → 自动锁定** 中，选择「永不」

---

## 五、常见问题

### 5.1 天气不显示

- 检查 `.env` 文件中 `QWEATHER_API_KEY` 是否正确配置
- 检查网络是否正常
- 查看后端日志：`docker logs digital-frame-server`

### 5.2 图片不显示

- 确认 NAS 照片目录路径是否正确
- 确认目录中有 jpg/png 格式的图片
- 检查目录权限：`ls -la /volume4/photo`
- 查看后端日志：`docker logs digital-frame-server`

### 5.3 如何修改轮播间隔

编辑 `frontend/js/config.js` 中的 `slideshow.interval` 值（单位毫秒）：
```javascript
slideshow: {
  interval: 8000,  // 改为 5000 即5秒切换一次
}
```
修改后需要重启 Nginx 容器（或清除浏览器缓存）。

### 5.4 如何重启服务

```bash
# 进入项目目录
cd /volume1/docker/digital_frame

# 重启所有容器
docker-compose restart

# 或重新构建并启动
docker-compose down
docker-compose up -d
```

### 5.5 如何查看日志

```bash
# 查看后端日志
docker logs -f digital-frame-server

# 查看 Nginx 日志
docker logs -f digital-frame-nginx
```

---

## 六、端口说明

| 服务 | 容器内端口 | 宿主机端口 | 说明 |
|------|-----------|-----------|------|
| Nginx | 80 | 8080 | Web 访问端口 |
| Node.js | 3000 | - | 后端 API（仅内部访问） |

如需修改宿主机端口（如 8080 被占用），编辑 `docker-compose.yml`：
```yaml
ports:
  - "8081:80"  # 改为 8081
```

---

## 七、项目文件结构

```
digital_frame/
├── frontend/           # 前端代码
│   ├── index.html      # 主页面
│   ├── css/style.css   # 样式
│   └── js/             # JavaScript 模块
├── server/             # 后端服务
│   ├── Dockerfile
│   ├── .env            # 环境变量（需自行创建）
│   ├── .env.example    # 环境变量模板
│   ├── package.json
│   └── src/            # 源代码
├── nginx/              # Nginx 配置
│   └── default.conf
├── docker-compose.yml  # Docker 编排
└── docs/               # 文档
```
