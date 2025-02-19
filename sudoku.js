const boardSize = 9;
const board = [];
let startTime;
let difficulty = "medium";
let hints = 3;
let mistakes = 0;
const maxMistakes = 3;

// 🛠 Hàm tạo bảng Sudoku hợp lệ
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

// 🔥 Hàm ẩn số theo độ khó
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

// 🎲 Tạo bảng Sudoku và hiển thị lên giao diện
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
            cell.style.border = "1px solid gray";

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

// 🎯 Kiểm tra giá trị nhập vào
function handleInput(event) {
    const { row, col } = event.target.dataset;
    board[row][col].value = event.target.value.replace(/[^1-9]/, "");
    checkValidity(row, col);
}

// 🔎 Kiểm tra tính hợp lệ của số nhập vào
function checkValidity(row, col) {
    let valid = true;
    const value = board[row][col].value;

    if (!value) return;

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

// 🧠 Gợi ý người chơi
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

// 🏆 Kiểm tra xem người chơi đã hoàn thành chưa
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

// ⚙️ Thay đổi độ khó
function setDifficulty(level) {
    difficulty = level;
    generateSudoku();
}

// 🏁 Khi tải trang xong thì bắt đầu game
window.onload = function () {
    generateSudoku();
};
