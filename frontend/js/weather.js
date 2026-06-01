/**
 * Digital Frame - 天气模块
 * 通过后端代理API获取天气数据
 * 异常时自动隐藏天气模块，不影响其他功能
 */

// 天气状态
let weatherState = {
  timerId: null,
  isVisible: false,
};

/**
 * 天气图标映射（使用emoji）
 */
const WEATHER_ICONS = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '小雨': '🌦️',
  '中雨': '🌧️',
  '大雨': '🌧️',
  '雷阵雨': '⛈️',
  '雪': '❄️',
  '雾': '🌫️',
  '霾': '🌫️',
  '大风': '💨',
  '扬沙': '🏜️',
  '浮尘': '🌫️',
  '强对流': '🌪️',
};

/**
 * 获取天气图标
 * @param {string} text - 天气描述文字
 * @returns {string} emoji图标
 */
function getWeatherIcon(text) {
  if (!text) return '🌤️';

  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (text.includes(key)) {
      return icon;
    }
  }
  return '🌤️';
}

/**
 * 从后端获取天气数据
 * @returns {Promise<Object>} 天气数据
 */
async function fetchWeather() {
  const config = window.APP_CONFIG ? window.APP_CONFIG.weather : { apiUrl: '/api/weather' };
  const response = await fetch(config.apiUrl);

  if (!response.ok) {
    throw new Error(`获取天气失败: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 更新天气显示
 */
async function updateWeather() {
  try {
    const data = await fetchWeather();

    // 获取DOM元素
    const container = document.getElementById('weather-container');
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const windEl = document.getElementById('weather-wind');

    if (!tempEl || !descEl || !windEl) return;

    // 解析天气数据（兼容不同API返回格式）
    let temperature, text, windDir, windScale;

    if (data.now) {
      // 和风天气API格式
      temperature = data.now.temp;
      text = data.now.text;
      windDir = data.now.windDir;
      windScale = data.now.windScale;
    } else {
      // 通用格式
      temperature = data.temperature || data.temp || '--';
      text = data.text || data.weather || data.condition || '--';
      windDir = data.windDir || data.wind_direction || '';
      windScale = data.windScale || data.wind_scale || '';
    }

    // 温度单位
    const unit = (window.APP_CONFIG ? window.APP_CONFIG.weather.unit : 'c') === 'c' ? '°C' : '°F';

    // 更新DOM
    const icon = getWeatherIcon(text);
    tempEl.textContent = `${temperature}${unit}`;
    descEl.innerHTML = `${icon} ${text}`;

    if (windDir || windScale) {
      windEl.textContent = `🌬️ ${windDir} ${windScale}级`;
    } else {
      windEl.textContent = '';
    }

    // 显示天气容器
    if (container && !weatherState.isVisible) {
      container.classList.remove('hidden');
      container.classList.add('fade-in');
      weatherState.isVisible = true;
    }

    console.log('[Weather] 天气已更新');
  } catch (error) {
    console.warn('[Weather] 更新失败:', error.message);

    // 隐藏天气模块（不影响其他功能）
    const container = document.getElementById('weather-container');
    if (container) {
      container.classList.add('hidden');
      weatherState.isVisible = false;
    }
  }
}

/**
 * 初始化天气模块
 * 首次立即获取，之后按配置间隔刷新
 */
function initWeather() {
  // 立即获取一次天气
  updateWeather();

  // 设置定时刷新
  const config = window.APP_CONFIG ? window.APP_CONFIG.weather : { refreshInterval: 30 * 60 * 1000 };
  weatherState.timerId = setInterval(updateWeather, config.refreshInterval);

  console.log('[Weather] 天气模块已启动');
}

// 导出到全局
window.initWeather = initWeather;
