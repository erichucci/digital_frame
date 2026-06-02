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
 * 递归扫描照片目录，获取所有图片文件列表
 * @param {string} dir - 要扫描的目录路径
 * @param {string} [relativePath=''] - 相对路径前缀
 * @returns {string[]} 图片文件相对路径数组（按路径排序）
 */
function scanPhotos(dir, relativePath = '') {
  const photosDir = dir || config.photosPath;

  // 检查目录是否存在
  if (!fs.existsSync(photosDir)) {
    console.warn(`[Photos] 照片目录不存在: ${photosDir}`);
    return [];
  }

  let photos = [];

  // 读取目录内容
  const entries = fs.readdirSync(photosDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(photosDir, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // 递归扫描子目录
      const subPhotos = scanPhotos(fullPath, relPath);
      photos = photos.concat(subPhotos);
    } else if (entry.isFile()) {
      // 检查是否为允许的图片格式
      const ext = path.extname(entry.name).toLowerCase();
      if (config.allowedExtensions.includes(ext)) {
        photos.push(relPath);
      }
    }
  }

  // 按路径排序
  photos.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

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

    // 返回图片URL列表
    // 注意：对路径的每部分单独编码，避免将 / 编码为 %2F
    const photoUrls = photos.map(filename => {
      const parts = filename.split('/').map(part => encodeURIComponent(part));
      return `/api/photos/${parts.join('/')}`;
    });

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
 * GET /api/photos/:path(*)
 * 返回指定图片文件（支持子目录路径）
 */
router.get('/:path(*)', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.path);
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
