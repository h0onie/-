
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1560; // Width
canvas.height = 800; // Height

// Define pockets with corresponding words
const pockets = [
    { x: 50, y: 50, width: 200, height: 255, label: "[장애조기발견 선별검사]", correctWords: ["사회성숙도검사", "적응행동검사", "영유아발달검사"], words: [], maxRows: 6 },
    { x: 50, y: 400, width: 200, height: 255, label: "[시각청각지체]", correctWords: ["기초학습기능검사", "시력검사", "시기능/촉기능검사", "청력검사"], words: [], maxRows: 6 },
    { x: 300, y: 50, width: 200, height: 255, label: "[지적장애]", correctWords: ["지능검사", "사회성숙도검사", "적응행동검사", "기초학습검사", "운동능력검사"], words: [], maxRows: 6 },
    { x: 300, y: 400, width: 200, height: 255, label: "[정서행동자폐]", correctWords: ["적응행동검사", "성격진단검사", "행동발달평가", "학습준비도검사"], words: [], maxRows: 6 },
    { x: 550, y: 50, width: 200, height: 255, label: "[의사소통]", correctWords: ["구문검사", "음운검사", "언어발달검사"], words: [], maxRows: 6 },
    { x: 550, y: 400, width: 200, height: 255, label: "[학습장애]", correctWords: ["지능검사", "기초학습기능검사", "학습준비도검사", "시지각발달검사", "지각운동발달검사", "시각운동통합발달검사"], words: [], maxRows: 6 }
];

// Updated word list
const words = [
    "사회성숙도검사", "사회성숙도검사", "적응행동검사", "적응행동검사", "적응행동검사",
    "영유아발달검사", "기초학습기능검사", "기초학습기능검사", "시력검사", "시기능/촉기능검사",
    "청력검사", "지능검사", "지능검사", "기초학습검사", "운동능력검사",
    "성격진단검사", "행동발달평가", "학습준비도검사", "학습준비도검사", "구문검사",
    "음운검사", "언어발달검사", "시지각발달검사", "지각운동발달검사", "시각운동통합발달검사"
];

const wordPositions = [];
let startX = 850, startY = 50, boxWidth = 170, boxHeight = 25;

words.forEach((word, i) => {
    let col = i % 3, row = Math.floor(i / 3);
    wordPositions.push({
        text: word,
        x: startX + col * (boxWidth + 20),
        y: startY + row * (boxHeight + 10),
        width: boxWidth,
        height: boxHeight,
        originalX: startX + col * (boxWidth + 20),
        originalY: startY + row * (boxHeight + 10),
        placed: false
    });
});

let draggingWord = null;
let offsetX = 0, offsetY = 0;

// Game completion flag
let gameCompleted = false;
let fadeAlpha = 0;

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game message
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("다 외울 때까지 파이팅!", canvas.width / 2, 30);

    // Draw pockets
    pockets.forEach(pocket => {
        ctx.fillStyle = "lightgray";
        ctx.fillRect(pocket.x, pocket.y, pocket.width, pocket.height);
        ctx.strokeRect(pocket.x, pocket.y, pocket.width, pocket.height);
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(pocket.label, pocket.x + pocket.width / 2, pocket.y + 20);

        pocket.words.forEach((word, index) => {
            const wordY = pocket.y + 30 + index * (boxHeight + 2);
            ctx.fillStyle = "lightblue";
            ctx.fillRect(pocket.x + (pocket.width - boxWidth) / 2, wordY, boxWidth, boxHeight);
            ctx.strokeRect(pocket.x + (pocket.width - boxWidth) / 2, wordY, boxWidth, boxHeight);
            ctx.fillStyle = "black";
            ctx.fillText(word.text, pocket.x + pocket.width / 2, wordY + boxHeight / 2 + 5);
        });
    });

    // Draw draggable words
    wordPositions.forEach(word => {
        if (!word.placed) {
            ctx.fillStyle = "lightblue";
            ctx.fillRect(word.x, word.y, word.width, word.height);
            ctx.strokeRect(word.x, word.y, word.width, word.height);
            ctx.fillStyle = "black";
            ctx.fillText(word.text, word.x + word.width / 2, word.y + word.height / 2 + 5);
        }
    });

    // Game completion fade-out
    if (gameCompleted) {
        fadeAlpha += 0.01;
        if (fadeAlpha >= 1) fadeAlpha = 1;

        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 48px Arial";
        ctx.fillText("잘했어염~ 최고에염~", canvas.width / 2, canvas.height / 2);
    }
}

// Check if all words are placed
function checkGameCompletion() {
    if (wordPositions.every(word => word.placed)) {
        gameCompleted = true;
    }
}

// Mouse Events
canvas.addEventListener("mousedown", (e) => {
    const mouseX = e.offsetX, mouseY = e.offsetY;
    wordPositions.forEach(word => {
        if (!word.placed && mouseX > word.x && mouseX < word.x + word.width &&
            mouseY > word.y && mouseY < word.y + word.height) {
            draggingWord = word;
            offsetX = mouseX - word.x;
            offsetY = mouseY - word.y;
        }
    });
});

canvas.addEventListener("mousemove", (e) => {
    if (draggingWord) {
        draggingWord.x = e.offsetX - offsetX;
        draggingWord.y = e.offsetY - offsetY;
        draw();
    }
});

canvas.addEventListener("mouseup", () => {
    if (draggingWord) {
        pockets.forEach(pocket => {
            if (draggingWord.x + draggingWord.width > pocket.x &&
                draggingWord.x < pocket.x + pocket.width &&
                draggingWord.y + draggingWord.height > pocket.y &&
                draggingWord.y < pocket.y + pocket.height &&
                pocket.correctWords.includes(draggingWord.text) &&
                !pocket.words.some(w => w.text === draggingWord.text) &&
                pocket.words.length < pocket.maxRows) {
                pocket.words.push(draggingWord);
                draggingWord.placed = true;
                draggingWord = null;
                draw();
                checkGameCompletion();
                return;
            }
        });

        draggingWord.x = draggingWord.originalX;
        draggingWord.y = draggingWord.originalY;
        draggingWord = null;
        draw();
    }
});

draw();
