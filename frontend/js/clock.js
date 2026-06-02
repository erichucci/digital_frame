/**
 * Digital Frame - 时钟模块
 * 显示实时时间（年月日 + 星期 + 时分秒）
 * 使用设备本地时间，断网不受影响
 * 兼容 iOS 12 及以下（ES5 语法）
 */

// 星期映射
var WEEKDAY_NAMES = {
  'zh-CN': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  'en': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

/**
 * 格式化数字，补零到两位
 * @param {number} num
 * @returns {string}
 */
function padZero(num) {
  return num < 10 ? '0' + num : '' + num;
}

/**
 * 更新时钟显示
 */
function updateClock() {
  var now = new Date();
  var config = window.APP_CONFIG ? window.APP_CONFIG.clock : { locale: 'zh-CN', refreshInterval: 1000 };
  var locale = config.locale || 'zh-CN';

  // 格式化时间 HH:mm:ss
  var timeStr = padZero(now.getHours()) + ':' + padZero(now.getMinutes()) + ':' + padZero(now.getSeconds());

  // 格式化日期
  var dateStr;
  if (locale === 'zh-CN') {
    var weekDay = WEEKDAY_NAMES['zh-CN'][now.getDay()];
    dateStr = now.getFullYear() + '\u5E74' + (now.getMonth() + 1) + '\u6708' + now.getDate() + '\u65E5 ' + weekDay;
  } else {
    var weekDay = WEEKDAY_NAMES['en'][now.getDay()];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    dateStr = weekDay + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
  }

  // 更新DOM
  var timeEl = document.getElementById('clock-time');
  var dateEl = document.getElementById('clock-date');

  if (timeEl) timeEl.textContent = timeStr;
  if (dateEl) dateEl.textContent = dateStr;
}

/**
 * 初始化时钟
 * 每秒更新一次
 */
function initClock() {
  // 立即更新一次
  updateClock();

  // 设置定时器
  var config = window.APP_CONFIG ? window.APP_CONFIG.clock : { refreshInterval: 1000 };
  setInterval(updateClock, config.refreshInterval || 1000);
}

// 导出到全局
window.initClock = initClock;
