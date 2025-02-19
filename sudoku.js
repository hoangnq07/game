const boardSize = 9;
const board = [];
let startTime;
let difficulty = "medium";
let hints = 3;
let mistakes = 0;
const maxMistakes = 3;
const API_URL = "https://script.google.com/macros/s/AKfycbygIG-i-FudBDFPAFLuXPHpfEVf7RD0x6zLxxIduH6It-qMN4ZL9LQPos-FOV-4uzRCyQ/exec"; // Thay YOUR_SCRIPT_ID bằng ID của bạn

function generateSudoku() {
    document.getElementById("sudoku-board").innerHTML = "";

    startTime = new Date();
    hints = 3;
    mistakes = 0;
    updateHints();

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
            if (Math.random() > (difficulty === "easy" ? 0.5 : difficulty === "hard" ? 0.8 : 0.7)) {
                cell.value = Math.floor(Math.random() * 9) + 1;
                cell.disabled = true;
            }
            document.getElementById("sudoku-board").appendChild(cell);
            board[i][j] = cell;
        }
    }
}

function handleInput(event) {
    const { row, col } = event.target.dataset;
    board[row][col].value = event.target.value.replace(/[^1-9]/, "");
    checkValidity(row, col);
}

function checkValidity(row, col) {
    let valid = true;
    const value = board[row][col].value;

    for (let i = 0; i < boardSize; i++) {
        if ((board[row][i].value === value && i != col) || (board[i][col].value === value && i != row)) {
            valid = false;
        }
    }

    board[row][col].style.backgroundColor = valid ? "white" : "red";
    if (!valid) {
        mistakes++;
        if (mistakes >= maxMistakes) {
            alert("❌ Bạn đã nhập sai 3 lần, bạn thua!");
            generateSudoku();
        }
    }
}

function updateHints() {
    document.getElementById("hints").innerText = `💡 Gợi ý còn: ${hints}`;
}

function useHint() {
    if (hints > 0) {
        let emptyCells = [];
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (!board[i][j].value) {
                    emptyCells.push(board[i][j]);
                }
            }
        }
        if (emptyCells.length > 0) {
            let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            randomCell.value = Math.floor(Math.random() * 9) + 1;
            randomCell.disabled = true;
            hints--;
            updateHints();
        }
    } else {
        alert("❌ Hết gợi ý!");
    }
}

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
        alert(`🎉 Chúc mừng! Bạn đã hoàn thành Sudoku! Thời gian: ${completionTime} giây`);

        const playerName = document.getElementById("player-name").value || "Người chơi ẩn danh";
        saveScore(playerName, completionTime);
    } else {
        alert("❌ Có lỗi, hãy kiểm tra lại!");
    }
}

function setDifficulty(level) {
    difficulty = level;
    generateSudoku();
}

// Lưu điểm lên Google Sheets
async function saveScore(name, time) {
    try {
        const response = await fetch(`${API_URL}?action=save&name=${encodeURIComponent(name)}&time=${time}`);
        const result = await response.json();
        if (result.status === "success") {
            alert("✅ Điểm của bạn đã được lưu!");
            updateLeaderboard();
        } else {
            alert("❌ Lưu điểm thất bại, thử lại sau!");
        }
    } catch (error) {
        alert("❌ Lỗi kết nối, kiểm tra API_URL!");
    }
}

// Lấy bảng xếp hạng từ Google Sheets
async function updateLeaderboard() {
    try {
        const response = await fetch(`${API_URL}?action=getTopScores`);
        const scores = await response.json();
        
        const leaderboard = document.getElementById("leaderboard");
        leaderboard.innerHTML = "";

        scores.slice(0, 5).forEach(([name, time], index) => {
            const listItem = document.createElement("li");
            listItem.textContent = `🥇 ${index + 1}. ${name} - ${time} giây`;
            leaderboard.appendChild(listItem);
        });
    } catch (error) {
        alert("❌ Lỗi khi tải bảng xếp hạng!");
    }
}
async function getTopScores() {
    try {
        const response = await fetch("YOUR_DEPLOYED_URL?action=getTopScores");
        const scores = await response.json();
        console.log("🏆 Top 5 người chơi nhanh nhất:", scores);

        let leaderboard = document.getElementById("leaderboard");
        leaderboard.innerHTML = "<h2>🏆 Bảng Xếp Hạng</h2>";

        scores.forEach((player, index) => {
            leaderboard.innerHTML += `<p>${index + 1}. ${player.name} - ${player.time}s</p>`;
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
    }
}

getTopScores();
// Khi trang tải, khởi động game và bảng xếp hạng
window.onload = function () {
    generateSudoku();
    updateLeaderboard();
};
