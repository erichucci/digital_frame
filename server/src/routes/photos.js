/**
 * Digital Frame - 照片API路由
 * 提供照片列表和图片文件服务
 * 从NAS挂载目录读取照片
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const router = express.Router();

// 简单内存缓存
let photosCache = {
  data: null,
  timestamp: 0,
};

/**
 * 扫描照片目录，获取图片文件列表
 * @returns {string[]} 图片文件名数组（按文件名排序）
 */
function scanPhotos() {
  const photosDir = config.photosPath;

  // 检查目录是否存在
  if (!fs.existsSync(photosDir)) {
    console.warn(`[Photos] 照片目录不存在: ${photosDir}`);
    return [];
  }

  // 读取目录
  const files = fs.readdirSync(photosDir);

  // 过滤出图片文件，按文件名排序
  const photos = files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return config.allowedExtensions.includes(ext);
    })
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

  return photos;
}

/**
 * 获取照片列表（带缓存）
 * @returns {string[]} 图片文件名数组
 */
function getPhotoList() {
  const now = Date.now();

  // 缓存有效则直接返回
  if (photosCache.data && (now - photosCache.timestamp) < config.cache.photosTtl) {
    return photosCache.data;
  }

  // 重新扫描
  const photos = scanPhotos();
  photosCache = {
    data: photos,
    timestamp: now,
  };

  console.log(`[Photos] 扫描到 ${photos.length} 张图片`);
  return photos;
}

/**
 * GET /api/photos
 * 返回照片列表（URL数组）
 */
router.get('/', (req, res) => {
  try {
    const photos = getPhotoList();

    // 返回图片URL列表（相对路径，前端通过Nginx或直接访问）
    const photoUrls = photos.map(filename => `/api/photos/${encodeURIComponent(filename)}`);

    res.json({
      total: photos.length,
      photos: photoUrls,
    });
  } catch (error) {
    console.error('[Photos] 获取照片列表失败:', error.message);
    res.status(500).json({
      error: '获取照片列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/photos/:filename
 * 返回指定图片文件
 */
router.get('/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(config.photosPath, filename);

    // 安全检查：防止路径穿越
    const resolvedPath = path.resolve(filePath);
    const resolvedPhotosDir = path.resolve(config.photosPath);
    if (!resolvedPath.startsWith(resolvedPhotosDir)) {
      return res.status(403).json({ error: '禁止访问' });
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 检查文件扩展名
    const ext = path.extname(filename).toLowerCase();
    if (!config.allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: '不支持的图片格式' });
    }

    // 设置缓存头（浏览器缓存1小时）
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Expires', new Date(Date.now() + 3600000).toUTCString());

    // 发送图片文件
    res.sendFile(filePath);
  } catch (error) {
    console.error('[Photos] 获取图片失败:', error.message);
    res.status(500).json({
      error: '获取图片失败',
      message: error.message,
    });
  }
});

module.exports = router;
