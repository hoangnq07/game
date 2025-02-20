const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.static('public')); // 📁 Serve frontend từ "public" folder

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// 📡 WebSocket kết nối
io.on('connection', (socket) => {
    console.log(`📡 Người dùng kết nối: ${socket.id}`);

    // 👋 Chào người mới
    socket.emit('welcome', '👋 Chào mừng đến với phòng chat!');

    // 💬 Nhận và gửi tin nhắn
    socket.on('chatMessage', (data) => {
        console.log(`💌 Tin nhắn từ ${data.username}: ${data.message}`);
        io.emit('chatMessage', data); // Gửi cho tất cả user
    });

    // ❌ Người dùng ngắt kết nối
    socket.on('disconnect', () => {
        console.log(`❌ Người dùng ngắt kết nối: ${socket.id}`);
    });
});

server.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
