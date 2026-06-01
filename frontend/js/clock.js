/**
 * Digital Frame - 时钟模块
 * 显示实时时间（年月日 + 星期 + 时分秒）
 * 使用设备本地时间，断网不受影响
 */

// 星期映射
const WEEKDAY_NAMES = {
  'zh-CN': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  'en': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

/**
 * 格式化数字，补零到两位
 * @param {number} num
 * @returns {string}
 */
function padZero(num) {
  return String(num).padStart(2, '0');
}

/**
 * 更新时钟显示
 */
function updateClock() {
  const now = new Date();
  const config = window.APP_CONFIG ? window.APP_CONFIG.clock : { locale: 'zh-CN', refreshInterval: 1000 };
  const locale = config.locale || 'zh-CN';

  // 格式化时间 HH:mm:ss
  const timeStr = [
    padZero(now.getHours()),
    padZero(now.getMinutes()),
    padZero(now.getSeconds()),
  ].join(':');

  // 格式化日期
  let dateStr;
  if (locale === 'zh-CN') {
    const weekDay = WEEKDAY_NAMES['zh-CN'][now.getDay()];
    dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDay}`;
  } else {
    const weekDay = WEEKDAY_NAMES['en'][now.getDay()];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    dateStr = `${weekDay}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }

  // 更新DOM
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

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
  const config = window.APP_CONFIG ? window.APP_CONFIG.clock : { refreshInterval: 1000 };
  setInterval(updateClock, config.refreshInterval || 1000);

  console.log('[Clock] 时钟已启动');
}

// 导出到全局
window.initClock = initClock;
