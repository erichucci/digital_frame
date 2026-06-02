# Digital Frame API Documentation

## 基础信息

- **基础URL**: `http://<host>:8080/api`
- **版本**: v0.2.0
- **格式**: JSON

---

## 一、照片 API

### 1.1 获取照片列表

获取所有照片的访问 URL 列表（支持递归遍历子目录）。

**请求**

```
GET /api/photos
```

**响应示例**

```json
{
  "total": 34,
  "photos": [
    "/api/photos/20090821-%E5%B0%8F%E6%B0%B4%E5%B3%AA%2FIMG_2208.JPG",
    "/api/photos/IMG_2209.JPG"
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| total | number | 照片总数 |
| photos | string[] | 照片访问 URL 数组（URL 已编码） |

**失败响应**

```json
{
  "error": "获取照片列表失败",
  "message": "错误详情"
}
```

### 1.2 获取单张图片

获取指定图片文件（支持子目录路径）。

**请求**

```
GET /api/photos/:path(*)
```

| 参数 | 说明 | 示例 |
|------|------|------|
| path | 图片相对路径（支持子目录） | `20090821-小水峪/IMG_2222.JPG` |

**响应**

- 成功：直接返回图片二进制流（Content-Type: image/jpeg 等）
- 缓存：Cache-Control: public, max-age=3600（浏览器缓存1小时）

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 403 | 禁止访问（路径穿越检测） |
| 404 | 文件不存在 |
| 400 | 不支持的图片格式 |

---

## 二、天气 API

### 2.1 获取实时天气

通过后端代理和风天气 API，返回当前天气数据。

**请求**

```
GET /api/weather
```

**响应示例**

```json
{
  "code": "200",
  "updateTime": "2026-06-02T11:00+08:00",
  "now": {
    "obsTime": "2026-06-02T11:00+08:00",
    "temp": "30",
    "feelsLike": "28",
    "icon": "100",
    "text": "晴",
    "windDir": "南风",
    "windScale": "2",
    "humidity": "30"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 状态码，200 表示成功 |
| updateTime | string | 数据更新时间 |
| now.obsTime | string | 观测时间 |
| now.temp | string | 温度（℃） |
| now.feelsLike | string | 体感温度（℃） |
| now.icon | string | 天气图标代码 |
| now.text | string | 天气状况文字描述 |
| now.windDir | string | 风向 |
| now.windScale | string | 风力等级 |
| now.humidity | string | 相对湿度（%） |

**失败响应**

```json
{
  "error": "获取天气失败",
  "message": "错误详情"
}
```

### 2.2 和风天气 API 说明

| 项目 | 说明 |
|------|------|
| 服务商 | 和风天气 (QWeather) |
| 接口 | 实时天气 v3 (now) |
| 免费额度 | 1000 次/天 |
| 缓存策略 | 后端缓存 30 分钟（可配置） |
| 配置项 | `QWEATHER_API_KEY`、`QWEATHER_API_HOST`、`QWEATHER_LOCATION_ID` |

**请求地址**（后端代理，前端无需直接调用）

```
https://{QWEATHER_API_HOST}/v7/weather/now?location={LOCATION_ID}&key={API_KEY}
```

---

## 三、健康检查

### 3.1 服务状态

**请求**

```
GET /api/health
```

**响应示例**

```json
{
  "status": "ok",
  "version": "0.2.0",
  "uptime": 3600,
  "timestamp": "2026-06-02T11:42:00+08:00"
}
```

---

## 四、状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 304 | 未修改（浏览器缓存） |
| 400 | 请求参数错误 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 五、调用频次限制

| 接口 | 限制说明 |
|------|---------|
| 照片列表 | 后端缓存 5 分钟，实际扫描频次受限于此 |
| 单张图片 | 浏览器缓存 1 小时，无服务端限制 |
| 天气 | 后端缓存 30 分钟，实际调用和风 API 频次受限于此 |
| 健康检查 | 无限制 |
