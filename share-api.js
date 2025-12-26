
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

// API 路由：准备并发送一条图片消息
app.post('/api/prepare-message', async (req, res) => {
    const { chat_id } = req.body;

    if (!chat_id) {
        return res.status(400).json({ success: false, error: 'chat_id 是必填项' });
    }

    // 定义要发送的图文消息内容
    const photoMessage = {
        photo: 'https://picsum.photos/id/237/600/400',
        caption: '这是通过 Mini App 准备分享的图片！'
    };

    try {
        const params = {
            chat_id: chat_id,
            photo: photoMessage.photo,
            caption: photoMessage.caption
        };

        console.warn('注意: 正在使用 sendPhoto 直接发送消息，并返回 message_id 作为 prepared_message_id 的模拟。');
        
        const result = await callTelegramApi('sendPhoto', params);
        const prepared_message_id = result.ok ? result.result.message_id : null;

        if (prepared_message_id) {
            res.json({ success: true, prepared_message_id });
        } else {
            res.status(500).json({ success: false, error: '无法发送图片消息' });
        }
    } catch (error) {
        console.error('发送图片时出错:', error);
        res.status(500).json({ success: false, error: '服务器内部错误' });
    }
});

// API 路由：保存一条图文内联消息到 Telegram 平台
app.post('/api/save-inline-photo', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, error: 'user_id 是必填项' });
    }

    // 模拟的图文消息内容
    //生成随机id： 1 - 1000
    const randomId = Math.floor(Math.random() * 1000) + 1;
    const inlinePhotoResult = {
        type: 'photo',
        id: randomId.toString(), // 结果的唯一 ID
        photo_url: `https://picsum.photos/id/${randomId}/600/400`,
        thumbnail_url: `https://picsum.photos/id/${randomId}/80/80`,
        caption: '这是通过 Mini App 准备分享的图片！',
        description: '描述文案'
    };

    try {
        // 模拟保存过程，生成一个伪造的 msg_id
        const fakeMsgId = 'fake_prepared_msg_id_12345';
        console.log(`模拟保存图文消息成功，伪造的 msg_id: ${fakeMsgId}`);
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
                        [{ text: 'Open Game', url: 'https://t.me/hlsblogbot/hlsblog' }],
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
    console.log(`  POST /api/prepare-message - 准备一条消息并返回 ID`);
});
