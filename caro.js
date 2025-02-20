let boardSize = 10; // 📏 Kích thước ban đầu
const winLength = 5; // 🏆 5 ô liên tiếp để thắng
let board = Array(boardSize * boardSize).fill(null);

const playerSymbol = "❌";
const aiSymbol = "⭕";
let gameOver = false;

const boardContainer = document.getElementById("board-container");
const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset-btn");

function createBoard() {
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 40px)`;
    boardElement.innerHTML = "";

    board.forEach((cell, index) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.index = index;

        if (cell) {
            cellElement.textContent = cell;
            cellElement.classList.add("taken");
        }

        cellElement.addEventListener("click", handlePlayerMove);
        boardElement.appendChild(cellElement);
    });

    centerBoard();
}

// 🟡 Căn giữa bàn cờ sau mỗi thay đổi
function centerBoard() {
    const containerWidth = boardContainer.clientWidth;
    const containerHeight = boardContainer.clientHeight;

    const boardWidth = boardElement.scrollWidth;
    const boardHeight = boardElement.scrollHeight;

    boardContainer.scrollLeft = (boardWidth - containerWidth) / 2;
    boardContainer.scrollTop = (boardHeight - containerHeight) / 2;
}

function handlePlayerMove(e) {
    const index = parseInt(e.target.dataset.index);
    if (board[index] || gameOver) return;

    board[index] = playerSymbol;
    e.target.textContent = playerSymbol;
    e.target.classList.add("taken");

    const winningCells = checkWinner(playerSymbol);
    if (winningCells) return endGame("🎉 Bạn thắng!", winningCells);
    if (boardFull()) return endGame("🤝 Hòa!", []);

    checkExpandBoard(index); // 💥 Kiểm tra mở rộng

    statusText.textContent = "Lượt AI: ⭕";
    setTimeout(aiMove, 300);
}

// ✅ AI đơn giản với đánh giá điểm số
function aiMove() {
    let bestMove = getBestMove();
    board[bestMove] = aiSymbol;

    const cell = document.querySelector(`.cell[data-index='${bestMove}']`);
    cell.textContent = aiSymbol;
    cell.classList.add("taken");

    const winningCells = checkWinner(aiSymbol);
    if (winningCells) return endGame("💀 AI thắng!", winningCells);
    if (boardFull()) return endGame("🤝 Hòa!", []);

    checkExpandBoard(bestMove); // Kiểm tra mở rộng sau nước AI
    statusText.textContent = "Lượt của bạn: ❌";
}

// 💥 Mở rộng bàn cờ nếu đánh gần biên
function checkExpandBoard(index) {
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    const nearTop = row <= 1;
    const nearBottom = row >= boardSize - 2;
    const nearLeft = col <= 1;
    const nearRight = col >= boardSize - 2;

    let expand = false;

    if (nearTop || nearBottom || nearLeft || nearRight) {
        expand = true;

        // Tăng kích thước lưới
        boardSize += 2;

        // Tạo lưới mới lớn hơn
        const newBoard = Array(boardSize * boardSize).fill(null);

        const offset = 1; // Thêm một lớp ô ở mỗi bên

        // Dịch các ô cũ vào trung tâm lưới mới
        for (let r = 0; r < Math.sqrt(board.length); r++) {
            for (let c = 0; c < Math.sqrt(board.length); c++) {
                const oldIndex = r * Math.sqrt(board.length) + c;
                const newIndex = (r + offset) * boardSize + (c + offset);
                newBoard[newIndex] = board[oldIndex];
            }
        }

        board = newBoard;
        createBoard(); // Vẽ lại bàn cờ
    }

    if (expand) centerBoard();
}

// 📊 Đánh giá điểm số ô trống cho AI
function getBestMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            let score = evaluatePosition(i, aiSymbol) + evaluatePosition(i, playerSymbol) * 0.9;

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

// 📈 Đánh giá điểm số ô trống
function evaluatePosition(index, symbol) {
    const directions = [
        [0, 1],  // ngang
        [1, 0],  // dọc
        [1, 1],  // chéo xuống
        [1, -1]  // chéo lên
    ];

    let score = 0;

    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    for (let [dx, dy] of directions) {
        let count = 0;
        let openEnds = 0;

        for (let dir = -1; dir <= 1; dir += 2) {
            for (let i = 1; i < winLength; i++) {
                const newRow = row + dx * i * dir;
                const newCol = col + dy * i * dir;

                if (
                    newRow >= 0 && newRow < boardSize &&
                    newCol >= 0 && newCol < boardSize
                ) {
                    const cellValue = board[newRow * boardSize + newCol];
                    if (cellValue === symbol) {
                        count++;
                    } else if (cellValue === null) {
                        openEnds++;
                        break;
                    } else {
                        break;
                    }
                }
            }
        }

        if (count >= winLength - 1) score += 1000; // Thắng ngay
        else if (count === winLength - 2) score += 100;
        else if (count === winLength - 3) score += 50;
        else if (count === winLength - 4) score += 10;
    }

    return score;
}

// ✅ Kiểm tra thắng
function checkWinner(symbol) {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const directions = [
                [0, 1],  // ngang
                [1, 0],  // dọc
                [1, 1],  // chéo xuống
                [1, -1]  // chéo lên
            ];

            for (let [dx, dy] of directions) {
                const line = [];
                for (let i = 0; i < winLength; i++) {
                    const newRow = row + dx * i;
                    const newCol = col + dy * i;
                    if (
                        newRow >= 0 && newRow < boardSize &&
                        newCol >= 0 && newCol < boardSize &&
                        board[newRow * boardSize + newCol] === symbol
                    ) {
                        line.push(newRow * boardSize + newCol);
                    } else {
                        break;
                    }
                }
                if (line.length === winLength) return line;
            }
        }
    }
    return null;
}

// ✅ Kết thúc trò chơi
function endGame(message, winningCells) {
    gameOver = true;
    statusText.textContent = message;

    winningCells.forEach(index => {
        const cell = document.querySelector(`.cell[data-index='${index}']`);
        cell.classList.add("win");
    });
}

function boardFull() {
    return board.every(cell => cell !== null);
}

resetButton.addEventListener("click", () => {
    boardSize = 10;
    board = Array(boardSize * boardSize).fill(null);
    gameOver = false;
    statusText.textContent = "Lượt của bạn: ❌";
    createBoard();
});

createBoard();
// 🎮 Hàm khởi động chế độ Đấu với AI
// 🎮 Hàm khởi động chế độ Đấu với AI
function loadAI() {
    aiResetGame(); // ✅ Gọi hàm reset bàn cờ AI
    statusText.textContent = "🤖 Đấu với AI – Bạn đi trước!";
    document.getElementById("resign-btn").style.display = "none"; // Ẩn nút Bỏ Cuộc trong chế độ AI
    document.getElementById("rematch-btn").style.display = "none"; // Ẩn nút Đấu Lại trong chế độ AI
}

// 🔄 Reset bàn cờ AI và đồng bộ với logic chính
function aiResetGame() {
    boardSize = 15; // ✅ Cập nhật boardSize toàn cục
    board = Array(boardSize * boardSize).fill(null); // ✅ Reset lại board chính

    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ""; // Clear bàn cờ

    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;

    board.forEach((cell, index) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.index = index;
        cellElement.addEventListener("click", handlePlayerMove); // ✅ Sử dụng handlePlayerMove
        boardElement.appendChild(cellElement);
    });

    statusText.textContent = "🤖 Bạn đi trước!";
    gameOver = false;
}

