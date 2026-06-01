/**
 * Digital Frame - 天气代理API路由
 * 代理和风天气API，隐藏API Key
 * 带缓存功能，减少API调用次数
 */

const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

// 天气缓存
let weatherCache = {
  data: null,
  timestamp: 0,
};

/**
 * 从和风天气API获取实时天气
 * @returns {Promise<Object>} 天气数据
 */
async function fetchWeatherFromAPI() {
  const { apiKey, baseUrl, locationId, timeout } = config.weather;

  if (!apiKey) {
    throw new Error('和风天气API Key未配置，请在 .env 文件中设置 QWEATHER_API_KEY');
  }

  const url = `${baseUrl}/weather/now`;
  const response = await axios.get(url, {
    params: {
      location: locationId,
      key: apiKey,
    },
    timeout: timeout,
  });

  // 检查API返回码
  if (response.data.code !== '200') {
    throw new Error(`和风天气API返回错误: code=${response.data.code}`);
  }

  return response.data;
}

/**
 * GET /api/weather
 * 返回实时天气数据（带缓存）
 */
router.get('/', async (req, res) => {
  try {
    const now = Date.now();

    // 检查缓存是否有效
    if (weatherCache.data && (now - weatherCache.timestamp) < config.cache.weatherTtl) {
      console.log('[Weather] 返回缓存数据');
      return res.json(weatherCache.data);
    }

    // 从API获取最新天气
    const data = await fetchWeatherFromAPI();

    // 更新缓存
    weatherCache = {
      data: data,
      timestamp: now,
    };

    console.log('[Weather] 天气数据已更新');
    res.json(data);
  } catch (error) {
    console.error('[Weather] 获取天气失败:', error.message);

    // 如果有缓存数据，返回缓存（即使过期）
    if (weatherCache.data) {
      console.log('[Weather] 返回过期缓存数据');
      return res.json(weatherCache.data);
    }

    // 无缓存可用，返回错误
    res.status(502).json({
      error: '获取天气数据失败',
      message: error.message,
    });
  }
});

module.exports = router;
