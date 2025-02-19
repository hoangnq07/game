// ✅ Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBNiq4dkwxO9ZvzJB5YNg_rtgQsQ6KPVhE",
    authDomain: "sudoku-15e57.firebaseapp.com",
    projectId: "sudoku-15e57",
    storageBucket: "sudoku-15e57.firebasestorage.app",
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

    let fullBoard = createValidSudokuBoard();
    let sudokuBoard = removeNumbers(fullBoard);

    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("input");
            cell.type = "text";
            cell.maxLength = 1;
            cell.dataset.row = i;
            cell.dataset.col = j;

            if (j % 3 === 0) cell.style.borderLeft = "3px solid black";
            if (i % 3 === 0) cell.style.borderTop = "3px solid black";
            if (i === 8) cell.style.borderBottom = "3px solid black";
            if (j === 8) cell.style.borderRight = "3px solid black";

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

// 🎯 Hàm xóa số theo độ khó
function removeNumbers(board) {
    let boardCopy = board.map(row => [...row]);
    let attempts = difficulty === "easy" ? 30 : difficulty === "medium" ? 40 : 50;

    while (attempts > 0) {
        let row = Math.floor(Math.random() * boardSize);
        let col = Math.floor(Math.random() * boardSize);
        if (boardCopy[row][col] !== 0) {
            boardCopy[row][col] = 0;
            attempts--;
        }
    }
    return boardCopy;
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

// 🔍 Kiểm tra kết quả Sudoku
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

// ⚡ Cập nhật gợi ý
function updateHints() {
    document.getElementById("hints").innerText = `💡 Gợi ý còn: ${hints}`;
}

// 🔥 Tải trò chơi và bảng xếp hạng khi mở trang
window.onload = function () {
    generateSudoku();
    loadLeaderboard();
};
