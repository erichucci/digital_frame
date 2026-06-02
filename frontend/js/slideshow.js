/**
 * Digital Frame - 图片轮播模块
 * 从后端API获取图片列表，自动轮播
 * 支持预加载、淡入淡出过渡、异常重试
 * 兼容 iOS 12 及以下（ES5 语法）
 */

// 轮播状态
var slideshowState = {
  photos: [],           // 图片URL列表
  currentIndex: 0,      // 当前图片索引
  timerId: null,        // 定时器ID
  isLoading: false,     // 是否正在加载
  retryCount: 0,        // 当前重试次数
  isPaused: false,      // 是否暂停
  pauseTimerId: null,   // 暂停定时器ID
};

/**
 * 从后端获取图片列表
 * @param {function} callback - 回调函数，参数为 (error, photos)
 */
function fetchPhotos(callback) {
  var config = window.APP_CONFIG ? window.APP_CONFIG.slideshow : { apiUrl: '/api/photos' };
  var xhr = new XMLHttpRequest();
  xhr.open('GET', config.apiUrl, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          // 支持两种返回格式: 数组 或 { photos: [...] }
          if (Array.isArray(data)) {
            callback(null, data);
          } else if (data && Array.isArray(data.photos)) {
            callback(null, data.photos);
          } else {
            callback(new Error('图片列表格式错误'));
          }
        } catch (e) {
          callback(new Error('解析图片列表失败'));
        }
      } else {
        callback(new Error('获取图片列表失败: ' + xhr.status));
      }
    }
  };
  xhr.onerror = function() {
    callback(new Error('网络请求失败'));
  };
  xhr.send();
}

/**
 * 预加载图片
 * @param {string} url - 图片URL
 * @param {function} callback - 加载完成回调
 */
function preloadImage(url, callback) {
  var img = new Image();
  img.onload = function() {
    if (callback) callback(null);
  };
  img.onerror = function() {
    if (callback) callback(new Error('图片加载失败: ' + url));
  };
  img.src = url;
}

/**
 * 切换图片
 * @param {number} index - 目标图片索引
 */
function switchToImage(index) {
  var imgEl = document.getElementById('slideshow-image');
  if (!imgEl || slideshowState.photos.length === 0) return;

  var url = slideshowState.photos[index];
  if (!url) return;

  // 立即更新当前索引
  slideshowState.currentIndex = index;

  // 预加载下一张
  var nextIndex = (index + 1) % slideshowState.photos.length;
  if (slideshowState.photos[nextIndex]) {
    preloadImage(slideshowState.photos[nextIndex], function() {});
  }

  // 移除 active 类（触发淡出）
  imgEl.className = imgEl.className.replace(/\bactive\b/g, '').trim();

  // 使用 Image 对象预加载当前图片（div 元素没有 onload 事件）
  var loader = new Image();
  loader.onload = function() {
    // 加载完成后设置 backgroundImage 并显示
    imgEl.style.backgroundImage = 'url(' + url + ')';
    imgEl.className = imgEl.className.trim();
    imgEl.className += ' active';
  };
  loader.onerror = function() {
    // 加载失败时尝试下一张
    slideshowState.retryCount++;
    var maxRetries = window.APP_CONFIG ? window.APP_CONFIG.slideshow.maxRetries : 3;
    if (slideshowState.retryCount < maxRetries) {
      setTimeout(function() { nextPhoto(); }, 2000);
    }
  };
  loader.src = url;
}

/**
 * 下一张图片
 */
function nextPhoto() {
  if (slideshowState.photos.length === 0) return;

  var nextIndex = (slideshowState.currentIndex + 1) % slideshowState.photos.length;
  switchToImage(nextIndex);
}

/**
 * 上一张图片
 */
function prevPhoto() {
  if (slideshowState.photos.length === 0) return;

  var prevIndex = (slideshowState.currentIndex - 1 + slideshowState.photos.length) % slideshowState.photos.length;
  switchToImage(prevIndex);
}

/**
 * 启动轮播定时器
 */
function startSlideshowTimer() {
  stopSlideshowTimer();

  var config = window.APP_CONFIG ? window.APP_CONFIG.slideshow : { interval: 8000 };
  slideshowState.timerId = setInterval(function() {
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
function initSlideshow() {
  fetchPhotos(function(error, photos) {
    if (error) {
      console.error('[Slideshow] 初始化失败:', error.message);
      // 显示占位提示
      var imgEl = document.getElementById('slideshow-image');
      if (imgEl) {
        imgEl.style.display = 'none';
      }
      return;
    }

    slideshowState.photos = photos;

    if (slideshowState.photos.length === 0) {
      console.warn('[Slideshow] 没有找到图片');
      var imgEl = document.getElementById('slideshow-image');
      if (imgEl) {
        imgEl.style.display = 'none';
      }
      return;
    }

    // 显示第一张图片
    slideshowState.currentIndex = 0;
    switchToImage(0);

    // 启动轮播
    startSlideshowTimer();
  });
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
  slideshowState.pauseTimerId = setTimeout(function() {
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
