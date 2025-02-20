// 🎮 Lấy Canvas và Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🎨 Load hình ảnh
const images = {
    bird: "assets/bird.png",
    bg: "assets/bg.png",
    pipeUp: "assets/pipeUp.png",
    pipeDown: "assets/pipeDown.png",
    fg: "assets/fg.png"
};

const assets = {};
let assetsLoaded = 0;
const totalAssets = Object.keys(images).length;

// ✅ Load tất cả hình ảnh
for (let key in images) {
    assets[key] = new Image();
    assets[key].src = images[key];
    assets[key].onload = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) startGame();
    };
}

// 🐦 Cài đặt game
const CONFIG = {
    birdX: 50,
    gravity: 0.25,
    jumpStrength: 5,
    pipeGap: 120,
    pipeSpeed: 2,
    pipeFrequency: 90 // frame
};

let birdY = canvas.height / 2;
let birdVelocity = 0;
let score = 0;
let frameCount = 0;
let pipes = [];
let gameOver = false;

// 🎹 Điều khiển (Nhấn Space để bay)
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !gameOver) {
        birdVelocity = -CONFIG.jumpStrength;
    } else if (gameOver && e.code === "Space") {
        restartGame();
    }
});

// 🎯 Bắt đầu game
function startGame() {
    pipes.push({ x: canvas.width, y: randomPipeY() });
    draw();
}

// 🔄 Hàm vẽ chính
function draw() {
    if (gameOver) {
        showGameOver();
        return;
    }

    ctx.drawImage(assets.bg, 0, 0); // 🌄 Background

    // 🟢 Vẽ và di chuyển ống
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        let constant = assets.pipeUp.height + CONFIG.pipeGap;

        // Vẽ ống
        ctx.drawImage(assets.pipeUp, pipe.x, pipe.y);
        ctx.drawImage(assets.pipeDown, pipe.x, pipe.y + constant);

        // Di chuyển ống
        pipe.x -= CONFIG.pipeSpeed;

        // Thêm ống mới khi cần
        if (pipe.x === canvas.width - CONFIG.pipeFrequency) {
            pipes.push({ x: canvas.width, y: randomPipeY() });
        }

        // ✅ Kiểm tra va chạm
        if (
            CONFIG.birdX + assets.bird.width >= pipe.x &&
            CONFIG.birdX <= pipe.x + assets.pipeUp.width &&
            (birdY <= pipe.y + assets.pipeUp.height ||
                birdY + assets.bird.height >= pipe.y + constant) ||
            birdY + assets.bird.height >= canvas.height - assets.fg.height
        ) {
            gameOver = true;
        }

        // 🎉 Cộng điểm khi vượt qua ống
        if (pipe.x + assets.pipeUp.width === CONFIG.birdX) {
            score++;
        }
    }

    // Xóa ống đã ra khỏi màn hình
    pipes = pipes.filter(pipe => pipe.x + assets.pipeUp.width > 0);

    // 🐦 Vẽ chim
    birdVelocity += CONFIG.gravity;
    birdY += birdVelocity;
    ctx.drawImage(assets.bird, CONFIG.birdX, birdY);

    // 🌿 Vẽ nền đất
    ctx.drawImage(assets.fg, 0, canvas.height - assets.fg.height);

    // 📊 Hiển thị điểm
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, canvas.height - 20);

    frameCount++;
    requestAnimationFrame(draw);
}

// 🟡 Vẽ Game Over
function showGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.fillText("💀 Game Over!", canvas.width / 2 - 80, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2 - 40, canvas.height / 2 + 20);
    ctx.fillText("Press Space to Restart", canvas.width / 2 - 100, canvas.height / 2 + 60);
}

// 🔄 Khởi động lại game
function restartGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    score = 0;
    pipes = [];
    frameCount = 0;
    gameOver = false;
    pipes.push({ x: canvas.width, y: randomPipeY() });
    draw();
}

// 🎲 Random vị trí ống
function randomPipeY() {
    return Math.floor(Math.random() * (assets.pipeUp.height - assets.pipeUp.height / 2)) - assets.pipeUp.height;
}
