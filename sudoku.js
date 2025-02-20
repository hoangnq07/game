// ✅ Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBNiq4dkwxO9ZvzJB5YNg_rtgQsQ6KPVhE",
    authDomain: "sudoku-15e57.firebaseapp.com",
    projectId: "sudoku-15e57",
    storageBucket: "sudoku-15e57.appspot.com",
    messagingSenderId: "779507474162",
    appId: "1:779507474162:web:a27caae9cd9df8eefa7a6b",
    measurementId: "G-SFP9ESLNWB"
};

// 🚀 Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const boardSize = 9;
const board = [];
let startTime;
let difficulty = "medium";
let hints = 3;
let mistakes = 0;
const maxMistakes = 3;
let fullBoard = []; // 🔥 Khai báo toàn cục
// ✅ Kiểm tra kết nối Firebase
db.collection("test").add({
    message: "Hello from UMD!",
    timestamp: new Date()
})
    .then(() => console.log("✅ Firebase UMD hoạt động!"))
    .catch((error) => console.error("❌ Lỗi kết nối:", error));

// 🔥 Tạo Sudoku hợp lệ
function createValidSudokuBoard() {
    let board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));

    function isValid(board, row, col, num) {
        for (let i = 0; i < boardSize; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
            let boxRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
            let boxCol = Math.floor(col / 3) * 3 + (i % 3);
            if (board[boxRow][boxCol] === num) return false;
        }
        return true;
    }

    function solve(board) {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 0) {
                    let numbers = [...Array(9).keys()].map(n => n + 1).sort(() => Math.random() - 0.5);
                    for (let num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solve(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve(board);
    return board;
}

// 🎲 Sinh bàn Sudoku và hiển thị
function generateSudoku() {
    document.getElementById("sudoku-board").innerHTML = "";
    startTime = new Date();
    hints = 3;
    mistakes = 0;
    updateHints();
    updateMistakes();

    fullBoard = createValidSudokuBoard(); // 🔥 Lưu lại bảng hoàn chỉnh
    let sudokuBoard = removeNumbers(fullBoard); // Tạo bản Sudoku hiển thị

    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("input");
            cell.type = "text";
            cell.maxLength = 1;
            cell.dataset.row = i;
            cell.dataset.col = j;

            cell.addEventListener("input", handleInput);

            if (sudokuBoard[i][j] !== 0) {
                cell.value = sudokuBoard[i][j];
                cell.disabled = true;
            }

            document.getElementById("sudoku-board").appendChild(cell);
            board[i][j] = cell;
        }
    }
}
// 🎲 Xóa số theo độ khó (Fix)
function removeNumbers(board) {
    const boardCopy = board.map(row => [...row]);
    let attempts = difficulty === "easy" ? 30 : difficulty === "medium" ? 40 : 50;
    let removed = 0;

    while (removed < attempts) {
        let row = Math.floor(Math.random() * boardSize);
        let col = Math.floor(Math.random() * boardSize);

        if (boardCopy[row][col] !== 0) {
            boardCopy[row][col] = 0;
            removed++;
        }
    }
    return boardCopy;
}

// ✅ Cải thiện handleInput (Kiểm tra dữ liệu nhập vào)
function handleInput(event) {
    const cell = event.target;
    const { row, col } = cell.dataset;
    const value = cell.value.replace(/[^1-9]/, ""); // Chỉ chấp nhận số 1-9
    cell.value = value;

    if (value === "") return; // Bỏ qua nếu ô bị xóa

    // Kiểm tra trùng lặp trong hàng, cột và ô 3x3
    let valid = true;
    for (let i = 0; i < boardSize; i++) {
        if ((board[row][i].value === value && i != col) || 
            (board[i][col].value === value && i != row)) {
            valid = false;
        }
    }

    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
        for (let c = boxColStart; c < boxColStart + 3; c++) {
            if (board[r][c].value === value && (r != row || c != col)) {
                valid = false;
            }
        }
    }

    // Nếu sai, tăng số lỗi và đổi màu ô
    if (!valid) {
        cell.style.backgroundColor = "red";
        mistakes++;
        updateMistakes();

        if (mistakes >= maxMistakes) {
            alert("❌ Bạn đã vượt quá số lỗi cho phép. Trò chơi kết thúc!");
            generateSudoku();
        }
    } else {
        cell.style.backgroundColor = "white";
    }

    // Kiểm tra nếu bảng đã đầy đủ
    if (isBoardFull()) {
        if (isBoardCorrect()) {
            let endTime = new Date();
            let completionTime = Math.round((endTime - startTime) / 1000);
            alert(`🎉 Hoàn thành trong ${completionTime} giây!`);

            const playerName = document.getElementById("player-name").value || "Ẩn danh";
            saveScore(playerName, completionTime);
            loadLeaderboard();
        } else {
            alert("❌ Có lỗi trong bảng. Kiểm tra lại!");
        }
    }
}

// Kiểm tra xem bảng đã đầy đủ chưa
function isBoardFull() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j].value === "") return false;
        }
    }
    return true;
}

// Kiểm tra xem bảng có đúng không dựa trên fullBoard
function isBoardCorrect() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (parseInt(board[i][j].value) !== fullBoard[i][j]) return false;
        }
    }
    return true;
}
function updateMistakes() {
    document.getElementById("mistakes").innerText = `❌ Lỗi sai: ${mistakes}/${maxMistakes}`;
}

// 🏆 Lưu điểm lên Firestore
function saveScore(playerName, timeTaken) {
    db.collection("scores").add({
        name: playerName,
        time: timeTaken,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => console.log("✅ Điểm số đã lưu thành công!"))
    .catch(error => console.error("❌ Lỗi khi lưu điểm:", error));
}

// 📊 Hiển thị bảng xếp hạng
function loadLeaderboard() {
    db.collection("scores").orderBy("time", "asc").limit(10).get()
    .then(querySnapshot => {
        let leaderboard = "";
        querySnapshot.forEach(doc => {
            const data = doc.data();
            leaderboard += `<li>${data.name} - ${data.time} giây</li>`;
        });
        document.getElementById("leaderboard").innerHTML = leaderboard;
    })
    .catch(error => console.error("❌ Lỗi khi tải bảng xếp hạng:", error));
}

// ✅ Kiểm tra kết quả Sudoku
function checkSudoku() {
    let valid = true;
    for (let i = 0; i < boardSize; i++) {
        const rowSet = new Set();
        const colSet = new Set();
        for (let j = 0; j < boardSize; j++) {
            const rowValue = board[i][j].value;
            const colValue = board[j][i].value;
            if (rowValue && rowSet.has(rowValue)) valid = false;
            if (colValue && colSet.has(colValue)) valid = false;
            rowSet.add(rowValue);
            colSet.add(colValue);
        }
    }

    if (valid) {
        let endTime = new Date();
        let completionTime = Math.round((endTime - startTime) / 1000);
        alert(`🎉 Hoàn thành trong ${completionTime} giây`);

        const playerName = document.getElementById("player-name").value || "Ẩn danh";
        saveScore(playerName, completionTime);
        loadLeaderboard();
    } else {
        alert("❌ Có lỗi trong bảng, kiểm tra lại!");
    }
}
// 🎯 Hàm Gợi Ý
function giveHint() {
    if (hints <= 0) {
        alert("❌ Hết gợi ý!");
        return;
    }

    if (!fullBoard || fullBoard.length === 0) {
        alert("⚠️ Bảng Sudoku chưa được tạo!");
        return;
    }

    // Tìm ô trống đầu tiên để điền gợi ý
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = board[row][col];
            if (cell.value === "") {
                // Điền số từ fullBoard
                cell.value = fullBoard[row][col];
                cell.disabled = true; 
                cell.style.backgroundColor = "#d0ffd0"; // Màu gợi ý

                hints--;
                updateHints();

                // Kiểm tra nếu hoàn thành sau gợi ý
                if (isBoardFull() && isBoardCorrect()) {
                    let endTime = new Date();
                    let completionTime = Math.round((endTime - startTime) / 1000);
                    alert(`🎉 Hoàn thành trong ${completionTime} giây!`);
                    const playerName = document.getElementById("player-name").value || "Ẩn danh";
                    saveScore(playerName, completionTime);
                }

                return; // Chỉ gợi ý 1 ô mỗi lần
            }
        }
    }

    alert("✔️ Không còn ô trống nào để gợi ý!");
}


// ⚡ Cập nhật gợi ý
function updateHints() {
    document.getElementById("hints").innerText = `💡 Gợi ý còn: ${hints}`;
}
function changeDifficulty() {
    difficulty = document.getElementById("difficulty").value;
    generateSudoku(); // Tạo lại bàn sau khi đổi độ khó
}
// 🔥 Tải trò chơi và bảng xếp hạng khi mở trang
window.onload = function () {
    generateSudoku();
    loadLeaderboard();
};
