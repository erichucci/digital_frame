/**
 * Digital Frame - 图片轮播模块
 * 从后端API获取图片列表，自动轮播
 * 支持预加载、淡入淡出过渡、异常重试
 */

// 轮播状态
let slideshowState = {
  photos: [],           // 图片URL列表
  currentIndex: 0,      // 当前图片索引
  timerId: null,        // 定时器ID
  isLoading: false,     // 是否正在加载
  retryCount: 0,        // 当前重试次数
  isPaused: false,      // 是否暂停
};

/**
 * 从后端获取图片列表
 * @returns {Promise<string[]>} 图片URL数组
 */
async function fetchPhotos() {
  const config = window.APP_CONFIG ? window.APP_CONFIG.slideshow : { apiUrl: '/api/photos' };
  const response = await fetch(config.apiUrl);

  if (!response.ok) {
    throw new Error(`获取图片列表失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // 支持两种返回格式: 数组 或 { photos: [...] }
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.photos)) {
    return data.photos;
  } else {
    throw new Error('图片列表格式错误');
  }
}

/**
 * 预加载图片
 * @param {string} url - 图片URL
 * @returns {Promise<void>}
 */
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`图片加载失败: ${url}`));
    img.src = url;
  });
}

/**
 * 切换图片
 * @param {number} index - 目标图片索引
 */
function switchToImage(index) {
  const imgEl = document.getElementById('slideshow-image');
  if (!imgEl || slideshowState.photos.length === 0) return;

  const url = slideshowState.photos[index];
  if (!url) return;

  // 预加载下一张
  const nextIndex = (index + 1) % slideshowState.photos.length;
  if (slideshowState.photos[nextIndex]) {
    preloadImage(slideshowState.photos[nextIndex]).catch(() => {});
  }

  // 切换图片（淡入淡出通过CSS transition实现）
  imgEl.classList.remove('active');
  imgEl.src = url;

  // 图片加载完成后显示
  imgEl.onload = () => {
    imgEl.classList.add('active');
    slideshowState.currentIndex = index;
  };

  imgEl.onerror = () => {
    // 加载失败时尝试下一张
    console.warn(`[Slideshow] 图片加载失败: ${url}`);
    slideshowState.retryCount++;
    if (slideshowState.retryCount < (window.APP_CONFIG ? window.APP_CONFIG.slideshow.maxRetries : 3)) {
      setTimeout(() => nextPhoto(), 2000);
    }
  };
}

/**
 * 下一张图片
 */
function nextPhoto() {
  if (slideshowState.photos.length === 0) return;

  const nextIndex = (slideshowState.currentIndex + 1) % slideshowState.photos.length;
  switchToImage(nextIndex);
}

/**
 * 上一张图片
 */
function prevPhoto() {
  if (slideshowState.photos.length === 0) return;

  const prevIndex = (slideshowState.currentIndex - 1 + slideshowState.photos.length) % slideshowState.photos.length;
  switchToImage(prevIndex);
}

/**
 * 启动轮播定时器
 */
function startSlideshowTimer() {
  stopSlideshowTimer();

  const config = window.APP_CONFIG ? window.APP_CONFIG.slideshow : { interval: 8000 };
  slideshowState.timerId = setInterval(() => {
    if (!slideshowState.isPaused) {
      nextPhoto();
    }
  }, config.interval);
}

/**
 * 停止轮播定时器
 */
function stopSlideshowTimer() {
  if (slideshowState.timerId) {
    clearInterval(slideshowState.timerId);
    slideshowState.timerId = null;
  }
}

/**
 * 初始化轮播
 */
async function initSlideshow() {
  try {
    // 获取图片列表
    slideshowState.photos = await fetchPhotos();

    if (slideshowState.photos.length === 0) {
      console.warn('[Slideshow] 没有找到图片');
      // 显示占位提示
      const imgEl = document.getElementById('slideshow-image');
      if (imgEl) {
        imgEl.style.display = 'none';
      }
      return;
    }

    console.log(`[Slideshow] 已加载 ${slideshowState.photos.length} 张图片`);

    // 显示第一张图片
    slideshowState.currentIndex = 0;
    switchToImage(0);

    // 启动轮播
    startSlideshowTimer();

    console.log('[Slideshow] 轮播已启动');
  } catch (error) {
    console.error('[Slideshow] 初始化失败:', error.message);

    // 显示占位提示
    const imgEl = document.getElementById('slideshow-image');
    if (imgEl) {
      imgEl.style.display = 'none';
    }
  }
}

/**
 * 暂停/恢复轮播
 * @param {boolean} paused
 */
function setSlideshowPaused(paused) {
  slideshowState.isPaused = paused;
}

/**
 * 手动切换 - 上一张（暂停自动轮播10秒）
 */
function handleManualPrev() {
  if (slideshowState.photos.length === 0) return;
  prevPhoto();
  pauseAutoPlay(10000);
}

/**
 * 手动切换 - 下一张（暂停自动轮播10秒）
 */
function handleManualNext() {
  if (slideshowState.photos.length === 0) return;
  nextPhoto();
  pauseAutoPlay(10000);
}

/**
 * 暂停自动轮播指定时间后恢复
 * @param {number} duration - 暂停时长（毫秒）
 */
function pauseAutoPlay(duration) {
  // 清除之前的暂停定时器
  if (slideshowState.pauseTimerId) {
    clearTimeout(slideshowState.pauseTimerId);
  }
  // 暂停自动轮播
  slideshowState.isPaused = true;
  // 设定时间后恢复
  slideshowState.pauseTimerId = setTimeout(() => {
    slideshowState.isPaused = false;
    slideshowState.pauseTimerId = null;
  }, duration);
}

// 导出到全局
window.initSlideshow = initSlideshow;
window.nextPhoto = nextPhoto;
window.prevPhoto = prevPhoto;
window.setSlideshowPaused = setSlideshowPaused;
window.handleManualPrev = handleManualPrev;
window.handleManualNext = handleManualNext;
