const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load hình ảnh
const bird = new Image();
const bg = new Image();
const pipeUp = new Image();
const pipeDown = new Image();
const fg = new Image();

bird.src = "assets/bird.png";
bg.src = "assets/bg.png";
pipeUp.src = "assets/pipeUp.png";
pipeDown.src = "assets/pipeDown.png";
fg.src = "assets/fg.png";

// Tạo chim
let bX = 50;
let bY = 150;
let gravity = 2;
let score = 0;

// Nhấn Space để bay
document.addEventListener("keydown", () => {
    bY -= 40;
});

// Tạo ống nước
let pipes = [];
pipes[0] = { x: canvas.width, y: 0 };

function draw() {
    ctx.drawImage(bg, 0, 0);

    for (let i = 0; i < pipes.length; i++) {
        let gap = 100;
        let constant = pipeUp.height + gap;
        ctx.drawImage(pipeUp, pipes[i].x, pipes[i].y);
        ctx.drawImage(pipeDown, pipes[i].x, pipes[i].y + constant);

        pipes[i].x -= 2;

        if (pipes[i].x === 150) {
            pipes.push({ x: canvas.width, y: Math.floor(Math.random() * pipeUp.height) - pipeUp.height });
        }

        // Kiểm tra va chạm
        if (
            (bX + bird.width >= pipes[i].x &&
                bX <= pipes[i].x + pipeUp.width &&
                (bY <= pipes[i].y + pipeUp.height ||
                    bY + bird.height >= pipes[i].y + constant)) ||
            bY + bird.height >= canvas.height - fg.height
        ) {
            location.reload();
        }

        if (pipes[i].x === 5) {
            score++;
        }
    }

    ctx.drawImage(fg, 0, canvas.height - fg.height);
    ctx.drawImage(bird, bX, bY);
    bY += gravity;

    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, canvas.height - 20);

    requestAnimationFrame(draw);
}

draw();
