// 📡 Kết nối tới WebSocket Server
const socket = io('http://localhost:3000'); // 👉 Đổi sang link Render sau khi deploy

const messagesDiv = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');

// 👋 Lời chào khi kết nối thành công
socket.on('welcome', (message) => {
    displayMessage('🟢 Server', message);
});

// 💬 Nhận tin nhắn từ server
socket.on('chatMessage', (data) => {
    displayMessage(data.username, data.message);
});

// 📤 Gửi tin nhắn
function sendMessage() {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();

    if (!username || !message) {
        alert("⚠️ Hãy nhập tên và tin nhắn trước khi gửi!");
        return;
    }

    const data = { username, message };
    socket.emit('chatMessage', data); // 📡 Gửi tin nhắn đến server

    messageInput.value = ""; // 🔄 Clear input sau khi gửi
}

// 📋 Hiển thị tin nhắn lên giao diện
function displayMessage(username, message) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // 📜 Tự động cuộn xuống tin mới nhất
}
