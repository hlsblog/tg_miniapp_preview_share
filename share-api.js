
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

// 从环境变量中获取 Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('错误：请设置 BOT_TOKEN 环境变量');
    process.exit(1);
}

app.use(express.json());
app.use(cors());


app.use(express.static(__dirname));

// 根路由，提供一个简单的导航页面
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>Telegram Web App 测试导航</title>
            <style>
                body { font-family: sans-serif; padding: 2em; }
                h1 { color: #333; }
                ul { list-style: none; padding: 0; }
                li { margin: 1em 0; }
                a { text-decoration: none; color: #007bff; font-size: 1.2em; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>欢迎来到 Telegram Web App 测试服务</h1>
            <p>点击下面的链接来测试不同的功能：</p>
            <ul>
                <li><a href="/test-prepared-share.html">测试 Prepared Message 发送</a></li>
                <!-- 更多测试页面可以添加到这里 -->
            </ul>
        </body>
        </html>
    `);
});

// Telegram Bot API 辅助函数
async function callTelegramApi(method, params) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        const data = await response.json();
        if (!data.ok) {
            console.error(`Telegram API 错误: ${data.description}`);
        }
        return data;
    } catch (error) {
        console.error('调用 Telegram API 时出错:', error);
        throw error;
    }
}

// API 路由：保存一条图文内联消息到 Telegram 平台
app.post('/api/save-inline-photo', async (req, res) => {
    const { user_id, title, photo_url, shareLink } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, error: 'user_id 是必填项' });
    }

    // 模拟的图文消息内容
    //生成随机id： 1 - 1000
    const randomId = 237;
    const inlinePhotoResult = {
        type: 'photo',
        id: randomId.toString(), // 结果的唯一 ID
        photo_url: photo_url,
        thumbnail_url: photo_url,
        caption: title || '',
        description: ''
    };

    try {
        //保存到tg服务器
        let rs = await callTelegramApi('savePreparedInlineMessage', {
            user_id: user_id,
            allow_user_chats: true,
            allow_bot_chats: true,
            allow_group_chats: true,
            allow_channel_chats: true,
            result: {
                type: inlinePhotoResult.type,
                id: inlinePhotoResult.id,
                photo_url: inlinePhotoResult.photo_url,
                thumbnail_url: inlinePhotoResult.thumbnail_url,
                caption: inlinePhotoResult.caption,
                description: inlinePhotoResult.description,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Open Game', url: shareLink }],
                    ],
                },
            }
        });
        console.log('savePreparedInlineMessage 响应:', rs);
        
        // 返回伪造的 msg_id 给前端
        res.json({ success: true, msg_id: rs.result.id });

    } catch (error) {
        console.error('模拟保存图文消息时出错:', error);
        res.status(500).json({ success: false, error: '服务器内部错误' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`✅ API 服务已启动`);
    console.log(`🔗 监听端口: http://localhost:${port}`);
    console.log('\n可用 API 路由:');
    console.log(`  POST /api/save-inline-photo - 保存一条图文内联消息到 Telegram 平台`);
});
