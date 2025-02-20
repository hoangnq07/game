let onlineBoardSize = 15;
let onlineBoard = Array(onlineBoardSize * onlineBoardSize).fill(null);
let onlinePlayerSymbol = "";
let onlineCurrentTurn = "❌";
let onlineRoomId = null;
let onlineGameOver = false;

// 🌐 Tải chế độ Online
function loadOnline() {
    onlineResetGame();
    document.getElementById("status").textContent = "🌐 Chế độ Online – Tạo hoặc tham gia phòng!";
    document.getElementById("online-controls").style.display = "block";
    document.getElementById("resign-btn").style.display = "none";
    document.getElementById("rematch-btn").style.display = "none";
}

// 🆕 Tạo phòng
function createRoom() {
    onlineRoomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    onlinePlayerSymbol = "❌"; // Người tạo phòng là X

    db.collection("rooms").doc(onlineRoomId).set({
        board: onlineBoard,
        currentTurn: "❌",
        gameOver: false,
        players: 1,
        winner: null
    }).then(() => {
        document.getElementById("status").textContent = `🎉 Phòng ${onlineRoomId} đã tạo. Chờ người tham gia...`;
        navigator.clipboard.writeText(onlineRoomId); // 📋 Copy mã phòng tự động
        alert(`📋 Mã phòng đã copy: ${onlineRoomId}`);
        document.getElementById("resign-btn").style.display = "inline";
        listenToRoom();
        onlineCreateBoard();
    });
}

// 🔗 Tham gia phòng
function joinRoom() {
    const inputCode = document.getElementById("room-code").value.trim().toUpperCase();
    if (!inputCode) return alert("⚠️ Nhập mã phòng!");

    db.collection("rooms").doc(inputCode).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();

            if (data.players >= 2) {
                alert("❌ Phòng đã đủ người!");
                return;
            }

            onlineRoomId = inputCode;
            onlinePlayerSymbol = "⭕"; // Người tham gia là O

            db.collection("rooms").doc(onlineRoomId).update({
                players: 2
            });

            document.getElementById("status").textContent = `✅ Đã tham gia phòng ${onlineRoomId}. Lượt: ❌`;
            document.getElementById("resign-btn").style.display = "inline";
            listenToRoom();
            onlineCreateBoard();
        } else {
            alert("❌ Phòng không tồn tại!");
        }
    });
}

// 🎧 Lắng nghe phòng
function listenToRoom() {
    db.collection("rooms").doc(onlineRoomId).onSnapshot((doc) => {
        const data = doc.data();
        onlineBoard = data.board;
        onlineCurrentTurn = data.currentTurn;
        onlineGameOver = data.gameOver;

        onlineUpdateBoard();

        if (data.winner) {
            document.getElementById("status").textContent = `🏆 Người thắng: ${data.winner}`;
            document.getElementById("rematch-btn").style.display = "inline";
        } else if (data.players < 2) {
            document.getElementById("status").textContent = `🕐 Chờ người tham gia... Mã phòng: ${onlineRoomId}`;
        } else if (!onlineGameOver) {
            document.getElementById("status").textContent = `Lượt: ${onlineCurrentTurn}`;
        } else {
            document.getElementById("status").textContent = "🏆 Trò chơi kết thúc!";
            document.getElementById("rematch-btn").style.display = "inline";
        }
    });
}

// 🎯 Xử lý nước đi
function onlineHandleMove(index) {
    if (onlineGameOver) return;
    if (onlineBoard[index] !== null) return;
    if (onlineCurrentTurn !== onlinePlayerSymbol) return alert("⏳ Chưa đến lượt bạn!");

    onlineBoard[index] = onlinePlayerSymbol;
    onlineCurrentTurn = onlineCurrentTurn === "❌" ? "⭕" : "❌";

    db.collection("rooms").doc(onlineRoomId).update({
        board: onlineBoard,
        currentTurn: onlineCurrentTurn
    });

    if (onlineCheckWinner(onlinePlayerSymbol)) {
        db.collection("rooms").doc(onlineRoomId).update({
            gameOver: true,
            winner: onlinePlayerSymbol
        });
    }
}

// ✅ Cập nhật bàn cờ
function onlineUpdateBoard() {
    onlineBoard.forEach((cell, index) => {
        const cellElement = document.querySelector(`.cell[data-index='${index}']`);
        cellElement.textContent = cell || "";
        cellElement.classList.remove("x", "o");

        if (cell === "❌") cellElement.classList.add("x");
        if (cell === "⭕") cellElement.classList.add("o");
    });
}

// 🎉 Kiểm tra thắng
function onlineCheckWinner(symbol) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let i = 0; i < onlineBoard.length; i++) {
        if (onlineBoard[i] !== symbol) continue;

        const row = Math.floor(i / onlineBoardSize);
        const col = i % onlineBoardSize;

        for (let [dx, dy] of directions) {
            let count = 1;
            for (let k = 1; k < 5; k++) {
                const newRow = row + dx * k;
                const newCol = col + dy * k;
                const newIndex = newRow * onlineBoardSize + newCol;

                if (
                    newRow >= 0 && newRow < onlineBoardSize &&
                    newCol >= 0 && newCol < onlineBoardSize &&
                    onlineBoard[newIndex] === symbol
                ) {
                    count++;
                } else {
                    break;
                }
            }
            if (count === 5) return true;
        }
    }
    return false;
}

// 🏳️ Bỏ Cuộc
function resignGame() {
    if (confirm("🏳️ Bạn có chắc muốn bỏ cuộc?")) {
        db.collection("rooms").doc(onlineRoomId).update({
            gameOver: true,
            winner: onlinePlayerSymbol === "❌" ? "⭕" : "❌"
        });
    }
}

// 🔄 Đấu Lại
function rematchGame() {
    onlineBoard = Array(onlineBoardSize * onlineBoardSize).fill(null);
    onlineCurrentTurn = "❌";
    onlineGameOver = false;

    db.collection("rooms").doc(onlineRoomId).update({
        board: onlineBoard,
        currentTurn: "❌",
        gameOver: false,
        winner: null
    });

    document.getElementById("rematch-btn").style.display = "none";
    document.getElementById("status").textContent = "🔄 Đấu Lại Bắt Đầu! Lượt: ❌";
}
// 🔄 Reset bàn cờ Online (dùng khi bắt đầu lại hoặc đổi phòng)
function onlineResetGame() {
    onlineBoard = Array(onlineBoardSize * onlineBoardSize).fill(null);
    onlineCurrentTurn = "❌";
    onlineGameOver = false;
    onlineRoomId = null;
    onlinePlayerSymbol = "";
    
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ""; // Clear bàn cờ

    document.getElementById("status").textContent = "🌐 Đã reset! Tạo hoặc tham gia phòng.";
    document.getElementById("resign-btn").style.display = "none";
    document.getElementById("rematch-btn").style.display = "none";
}