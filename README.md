# Telegram Web App 分享预览功能

这是一个 Telegram Web App 项目，实现了通过后端生成消息 ID 的分享预览功能。

## 功能特性

- ✅ 通过 Bot API 方法保存预处理的内联消息（PreparedInlineMessage）
- ✅ 前端发送预览事件：`WebView.postEvent('web_app_send_prepared_message')`
- ✅ 支持图文消息分享（InlineQueryResultPhoto）
- ✅ 本地测试模式支持

## 项目结构

```
tg_bot_test/
├── share-api.js          # 后端 API 服务
├── test-prepared-share.html  # 前端测试页面
├── test-inline-features.js   # 内联查询测试脚本
├── package.json          # 项目依赖配置
├── .env                  # 环境变量配置
└── .gitignore           # Git 忽略规则
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件并添加您的 Bot Token：

```env
BOT_TOKEN=your_bot_token_here
```

### 3. 启动服务

#### 常规启动
```bash
npm start
```

#### 使用 PM2 启动（推荐用于生产环境）
```bash
# 安装 PM2（如果尚未安装）
npm install -g pm2

# 启动应用
npm run pm2:start

# 查看日志
npm run pm2:logs

# 停止应用
npm run pm2:stop

# 重启应用
npm run pm2:restart

# 删除应用
npm run pm2:delete
```

服务将在 http://localhost:3000 启动

### 4. 测试功能

在 Telegram Web App 环境中打开 `test-prepared-share.html` 页面进行测试。

## API 接口

### POST /api/save-inline-photo

保存图文内联消息到 Telegram 平台，返回消息 ID。

**请求参数：**
```json
{
  "user_id": "user_id_here"
}
```

**响应示例：**
```json
{
  "success": true,
  "msg_id": "fake_prepared_msg_id_12345"
}
```

## 使用说明

### 图文消息格式

支持的图文消息格式（InlineQueryResultPhoto）：

```javascript
const result = { 
  type: 'photo', 
  id: '1', // 唯一 ID 
  photo_url: 'https://picsum.photos/id/237/600/400', 
  thumbnail_url: 'https://picsum.photos/id/237/80/80', 
  caption: '这是通过 Mini App 准备分享的图片！', 
  description: '描述文案' 
};
```

### 分享流程

1. 前端调用 `/api/save-inline-photo` 获取消息 ID
2. 使用 `tgWebview.postEvent('web_app_send_prepared_message', false, { id: msgId })` 触发分享对话框
3. 用户在对话框中选择聊天并发送消息

### 分享事件监听

您可以在前端监听分享事件来获知用户的操作结果：

```javascript
// 监听分享成功事件
telegram.WebView.onEvent('prepared_message_sent', function(data) {
    console.log('分享成功', data);
    // 处理分享成功逻辑
});

// 监听分享取消事件  
telegram.WebView.onEvent('prepared_message_failed', function(data) {
    console.log('分享取消', data);
    // 处理分享取消逻辑
});

// 监听分享失败事件
telegram.WebView.onEvent('prepared_message_failed', function(data) {
    console.log('分享失败', data);
    // 处理分享失败逻辑
});
```

这些事件可以帮助您：
- 跟踪用户分享行为
- 在分享成功后关闭 Web App
- 在分享失败后显示错误提示
- 记录分享统计信息

## 注意事项

- ⚠️ `savePreparedInlineMessage` 不是标准的 Telegram Bot API 方法，本项目中为模拟实现
- ⚠️ 需要在 Telegram Web App 环境中运行，否则 `tg.initDataUnsafe.user` 可能为空
- ⚠️ 确保已在 @BotFather 中启用机器人的内联模式

## 错误处理

### tg.initDataUnsafe.user 为空

当 `tg.initDataUnsafe.user` 为空时，代码会自动使用 `'unknown_user'` 作为默认值，确保 API 调用不会失败。

### 环境检测

代码会自动检测是否在 Telegram Web App 环境中运行，如果不在则会显示相应的错误提示。

## 技术栈

- **后端**：Node.js + Express
- **前端**：HTML + JavaScript + Telegram Web App API
- **依赖**：node-fetch, cors, dotenv

## 许可证

MIT License