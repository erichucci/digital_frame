整体架构：单层前端架构（表现层 + 业务逻辑层 + 数据源层，无后端服务）

表现层：HTML+Tailwind → 页面布局、全屏样式
逻辑层：JS → 轮播算法、时钟计算、天气请求、异常捕获
数据源：本地图片文件 + 第三方天气 HTTP 接口


项目源码目录落地设计（直接照这个建文件夹）
plaintextsrc/
├── css/        # 全局样式、Tailwind配置
├── js/
│   ├── clock.js    # 时钟模块
│   ├── slideshow.js# 图片轮播模块
│   └── weather.js  # 天气请求模块
└── assets/img/     # 存放轮播图片

第三方依赖清单：仅引入 Tailwind CSS CDN，无 npm 包依赖（适配老 iPad）
异常方案：天气接口请求失败→隐藏天气模块，不影响相册、时钟正常运行