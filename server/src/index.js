/**
 * Digital Frame - 后端服务入口
 * Express 服务器，提供照片和天气API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const photosRouter = require('./routes/photos');
const weatherRouter = require('./routes/weather');

const app = express();

// 获取应用版本号
// 优先级: 环境变量 APP_VERSION > VERSION 文件 > 默认值
let appVersion = process.env.APP_VERSION || '';
if (!appVersion) {
  const versionPath = path.join(__dirname, '../../VERSION');
  try {
    appVersion = fs.readFileSync(versionPath, 'utf-8').trim().replace(/^v/, '');
  } catch (e) {
    appVersion = '0.1.0';
    console.warn(`[Server] 无法读取 VERSION 文件，使用默认版本: ${appVersion}`);
  }
}

// ============================================
// 中间件
// ============================================

// CORS - 允许前端跨域访问
app.use(cors({
  origin: '*',
  methods: ['GET'],
}));

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ============================================
// 静态文件服务（生产环境通过Nginx提供）
// ============================================

// 开发环境下提供前端静态文件
if (process.env.NODE_ENV === 'development') {
  const frontendPath = path.join(__dirname, '../../frontend');
  app.use(express.static(frontendPath));
  console.log(`[Server] 开发模式 - 静态文件目录: ${frontendPath}`);
}

// ============================================
// API 路由
// ============================================

app.use('/api/photos', photosRouter);
app.use('/api/weather', weatherRouter);

// ============================================
// 健康检查
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: appVersion,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// 404 处理
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    message: `路径 ${req.method} ${req.url} 未找到`,
  });
});

// ============================================
// 错误处理
// ============================================

app.use((err, req, res, next) => {
  console.error('[Server] 未捕获错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试',
  });
});

// ============================================
// 启动服务器
// ============================================

app.listen(config.port, () => {
  console.log('========================================');
  console.log('  Digital Frame 后端服务');
  console.log(`  版本: ${appVersion}`);
  console.log(`  端口: ${config.port}`);
  console.log(`  照片目录: ${config.photosPath}`);
  console.log(`  天气城市ID: ${config.weather.locationId}`);
  console.log(`  天气API Key: ${config.weather.apiKey ? '已配置' : '未配置'}`);
  console.log('========================================');
});
