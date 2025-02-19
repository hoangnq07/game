const boardSize = 9;
const board = [];
let timer;
let timeLeft = 300; // 5 phút
let difficulty = "medium";
let score = 0;

function generateSudoku() {
    document.getElementById("sudoku-board").innerHTML = "";
    document.getElementById("sudoku-board").style.display = "grid";
    document.getElementById("sudoku-board").style.gridTemplateColumns = "repeat(9, 40px)";
    document.getElementById("sudoku-board").style.gridTemplateRows = "repeat(9, 40px)";
    document.getElementById("sudoku-board").style.gap = "2px";
    document.getElementById("sudoku-board").style.margin = "auto";
    document.getElementById("sudoku-board").style.width = "max-content";
    
    clearInterval(timer);
    timeLeft = difficulty === "easy" ? 600 : difficulty === "hard" ? 180 : 300;
    updateTimer();
    startTimer();
    
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("input");
            cell.type = "text";
            cell.maxLength = 1;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.style.width = "40px";
            cell.style.height = "40px";
            cell.style.textAlign = "center";
            cell.style.fontSize = "18px";
            cell.style.border = "1px solid black";
            cell.addEventListener("input", handleInput);
            if (Math.random() > (difficulty === "easy" ? 0.5 : difficulty === "hard" ? 0.8 : 0.7)) {
                const randomNumber = Math.floor(Math.random() * 9) + 1;
                cell.value = randomNumber;
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
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("⏰ Hết giờ! Bạn thua!");
        }
    }, 1000);
}

function updateTimer() {
    document.getElementById("timer").innerText = `⏳ Thời gian còn: ${timeLeft}s`;
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
        score += timeLeft;
        alert(`🎉 Chúc mừng! Bạn đã hoàn thành Sudoku! Điểm số: ${score}`);
        localStorage.setItem("highscore", Math.max(score, localStorage.getItem("highscore") || 0));
    } else {
        alert("❌ Có lỗi, hãy kiểm tra lại!");
    }
}

function setDifficulty(level) {
    difficulty = level;
    generateSudoku();
}

window.onload = generateSudoku;
