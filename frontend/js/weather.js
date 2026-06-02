/**
 * Digital Frame - 天气模块
 * 通过后端代理API获取天气数据
 * 异常时自动隐藏天气模块，不影响其他功能
 * 兼容 iOS 12 及以下（ES5 语法）
 */

// 天气状态
var weatherState = {
  timerId: null,
  isVisible: false,
};

/**
 * 天气图标映射（使用emoji）
 */
var WEATHER_ICONS = {
  '晴': '\u2600\uFE0F',
  '多云': '\u26C5',
  '阴': '\u2601\uFE0F',
  '小雨': '\uD83C\uDF26\uFE0F',
  '中雨': '\uD83C\uDF27\uFE0F',
  '大雨': '\uD83C\uDF27\uFE0F',
  '雷阵雨': '\u26C8\uFE0F',
  '雪': '\u2744\uFE0F',
  '雾': '\uD83C\uDF2B\uFE0F',
  '霾': '\uD83C\uDF2B\uFE0F',
  '大风': '\uD83D\uDCA8',
  '扬沙': '\uD83C\uDFDC\uFE0F',
  '浮尘': '\uD83C\uDF2B\uFE0F',
  '强对流': '\uD83C\uDF2A\uFE0F',
};

/**
 * 获取天气图标
 * @param {string} text - 天气描述文字
 * @returns {string} emoji图标
 */
function getWeatherIcon(text) {
  if (!text) return '\uD83C\uDF24\uFE0F';

  // 手动遍历对象（兼容 iOS 12，不用 Object.entries）
  for (var key in WEATHER_ICONS) {
    if (WEATHER_ICONS.hasOwnProperty(key)) {
      if (text.indexOf(key) !== -1) {
        return WEATHER_ICONS[key];
      }
    }
  }
  return '\uD83C\uDF24\uFE0F';
}

/**
 * 从后端获取天气数据
 * @param {function} callback - 回调函数，参数为 (error, data)
 */
function fetchWeather(callback) {
  var config = window.APP_CONFIG ? window.APP_CONFIG.weather : { apiUrl: '/api/weather' };
  var xhr = new XMLHttpRequest();
  xhr.open('GET', config.apiUrl, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          callback(null, data);
        } catch (e) {
          callback(new Error('解析天气数据失败'));
        }
      } else {
        callback(new Error('获取天气失败: ' + xhr.status));
      }
    }
  };
  xhr.onerror = function() {
    callback(new Error('网络请求失败'));
  };
  xhr.send();
}

/**
 * 更新天气显示
 */
function updateWeather() {
  fetchWeather(function(error, data) {
    if (error) {
      console.warn('[Weather] 更新失败:', error.message);
      // 隐藏天气模块（不影响其他功能）
      var container = document.getElementById('weather-container');
      if (container) {
        container.className = container.className.replace(/\bfade-in\b/g, '');
        if (container.className.indexOf('hidden') === -1) {
          container.className += ' hidden';
        }
        weatherState.isVisible = false;
      }
      return;
    }

    // 获取DOM元素
    var container = document.getElementById('weather-container');
    var tempEl = document.getElementById('weather-temp');
    var descEl = document.getElementById('weather-desc');
    var windEl = document.getElementById('weather-wind');

    if (!tempEl || !descEl || !windEl) return;

    // 解析天气数据（兼容不同API返回格式）
    var temperature, text, windDir, windScale;

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
    var unit = (window.APP_CONFIG ? window.APP_CONFIG.weather.unit : 'c') === 'c' ? '\u00B0C' : '\u00B0F';

    // 更新DOM
    var icon = getWeatherIcon(text);
    tempEl.textContent = temperature + unit;
    descEl.innerHTML = icon + ' ' + text;

    if (windDir || windScale) {
      windEl.textContent = '\uD83C\uDF2C\uFE0F ' + windDir + ' ' + windScale + '\u7EA7';
    } else {
      windEl.textContent = '';
    }

    // 显示天气容器
    if (container && !weatherState.isVisible) {
      container.className = container.className.replace(/\bhidden\b/g, '').trim();
      container.className += ' fade-in';
      weatherState.isVisible = true;
    }
  });
}

/**
 * 初始化天气模块
 * 首次立即获取，之后按配置间隔刷新
 */
function initWeather() {
  // 立即获取一次天气
  updateWeather();

  // 设置定时刷新
  var config = window.APP_CONFIG ? window.APP_CONFIG.weather : { refreshInterval: 30 * 60 * 1000 };
  weatherState.timerId = setInterval(updateWeather, config.refreshInterval);
}

// 导出到全局
window.initWeather = initWeather;
