const boardSize = 9;
const board = [];

function generateSudoku() {
    document.getElementById("sudoku-board").innerHTML = "";
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("input");
            cell.type = "text";
            cell.maxLength = 1;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("input", handleInput);
            if (Math.random() > 0.7) {
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
    alert(valid ? "✅ Sudoku hợp lệ!" : "❌ Có lỗi, hãy kiểm tra lại!");
}

window.onload = generateSudoku;
