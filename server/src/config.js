/**
 * Digital Frame - 服务端配置文件
 * 从环境变量读取配置，提供默认值
 */

// 加载 .env 文件（非 Docker 环境）
try {
  require('dotenv').config();
} catch (e) {
  // Docker 环境中通过环境变量传入，忽略 dotenv 错误
}

const config = {
  // 服务端口
  port: parseInt(process.env.PORT || '3000', 10),

  // 照片目录路径（Docker中为容器内路径）
  photosPath: process.env.PHOTOS_PATH || '/data/photos',

  // 允许的图片扩展名
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],

  // 和风天气配置
  weather: {
    // API Key（必填，从环境变量获取）
    apiKey: process.env.QWEATHER_API_KEY || '',
    // API 基础地址
    baseUrl: 'https://devapi.qweather.com/v7',
    // 城市ID（默认北京，可在 .env 中修改）
    locationId: process.env.QWEATHER_LOCATION_ID || '101010100',
    // 请求超时时间（毫秒）
    timeout: 5000,
  },

  // 缓存配置
  cache: {
    // 天气缓存时间（毫秒）- 默认30分钟
    weatherTtl: parseInt(process.env.WEATHER_CACHE_TTL || '1800000', 10),
    // 照片列表缓存时间（毫秒）- 默认5分钟
    photosTtl: parseInt(process.env.PHOTOS_CACHE_TTL || '300000', 10),
  },
};

module.exports = config;
