# ============================================
# Digital Frame 后端服务 - Dockerfile
# 基于 Node.js 18 轻量镜像
# ============================================

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制依赖配置文件
COPY package.json ./

# 安装依赖（生产环境仅安装生产依赖）
RUN npm install --production --no-audit --no-fund

# 复制源代码
COPY src/ ./src/

# 创建照片目录挂载点
RUN mkdir -p /data/photos

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动服务
CMD ["node", "src/index.js"]
