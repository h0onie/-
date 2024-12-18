const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 게임 모드 관리 변수
let practiceMode = false;

// 시작 화면 요소
const startScreen = document.getElementById("start-screen");
const practiceButton = document.getElementById("practice-mode");
const testButton = document.getElementById("test-mode");

// 단어 및 드래그 상태 관리 변수
let wordPositions = [];
let draggingWord = null;
let offsetX = 0, offsetY = 0;
let isDragging = false;

// 게임 초기화 함수
function initGame() {
    wordPositions = [];
    pockets.forEach(pocket => pocket.words = []);
    draggingWord = null;
    isDragging = false;
    gameCompleted = false;
    fadeAlpha = 0;

    shuffle(words);

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

    canvas.style.display = "block";
    startScreen.style.display = "none";

    draw();
}

practiceButton.addEventListener("click", () => {
    practiceMode = true;
    initGame();
});

testButton.addEventListener("click", () => {
    practiceMode = false;
    initGame();
});

canvas.width = 1560;
canvas.height = 800;

const pockets = [
    { x: 50, y: 50, width: 200, height: 255, label: "[장애조기발견 선별검사]", correctWords: ["사회성숙도검사", "적응행동검사", "영유아발달검사"], words: [], maxRows: 6 },
    { x: 50, y: 400, width: 200, height: 255, label: "[시각청각지체]", correctWords: ["기초학습기능검사", "시력검사", "시기능/촉기능검사", "청력검사"], words: [], maxRows: 6 },
    { x: 300, y: 50, width: 200, height: 255, label: "[지적장애]", correctWords: ["지능검사", "사회성숙도검사", "적응행동검사", "기초학습검사", "운동능력검사"], words: [], maxRows: 6 },
    { x: 300, y: 400, width: 200, height: 255, label: "[정서행동자폐]", correctWords: ["적응행동검사", "성격진단검사", "행동발달평가", "학습준비도검사"], words: [], maxRows: 6 },
    { x: 550, y: 50, width: 200, height: 255, label: "[의사소통]", correctWords: ["구문검사", "음운검사", "언어발달검사"], words: [], maxRows: 6 },
    { x: 550, y: 400, width: 200, height: 255, label: "[학습장애]", correctWords: ["지능검사", "기초학습기능검사", "학습준비도검사", "시지각발달검사", "지각운동발달검사", "시각운동통합발달검사"], words: [], maxRows: 6 }
];

const words = [
    "사회성숙도검사", "사회성숙도검사", "적응행동검사", "적응행동검사", "적응행동검사",
    "영유아발달검사", "기초학습기능검사", "기초학습기능검사", "시력검사", "시기능/촉기능검사",
    "청력검사", "지능검사", "지능검사", "기초학습검사", 
    "운동능력검사", "성격진단검사", "행동발달평가", "학습준비도검사", "학습준비도검사", "구문검사",
    "음운검사", "언어발달검사", "시지각발달검사", "지각운동발달검사", "시각운동통합발달검사"
];

const duplicateWords = ["사회성숙도검사", "적응행동검사", "지능검사", "기초학습기능검사", "학습준비도검사"];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pockets.forEach(pocket => {
        ctx.fillStyle = "lightgray";
        ctx.fillRect(pocket.x, pocket.y, pocket.width, pocket.height);
        ctx.strokeRect(pocket.x, pocket.y, pocket.width, pocket.height);
        ctx.fillStyle = "black";
        ctx.font = "bold 14px Arial";
        ctx.fillText(pocket.label, pocket.x + pocket.width / 2, pocket.y + 20);

        pocket.words.forEach((word, index) => {
            const wordY = pocket.y + 30 + index * (word.height + 2);
            ctx.fillStyle = "lightblue";
            ctx.fillRect(pocket.x + (pocket.width - word.width) / 2, wordY, word.width, word.height);
            ctx.strokeRect(pocket.x + (pocket.width - word.width) / 2, wordY, word.width, word.height);
            ctx.fillStyle = "black";
            ctx.fillText(word.text, pocket.x + pocket.width / 2, wordY + word.height / 2 + 5);
        });
    });

    wordPositions.forEach(word => {
        if (!word.placed) {
            ctx.fillStyle = "lightblue";
            ctx.fillRect(word.x, word.y, word.width, word.height);
            ctx.strokeRect(word.x, word.y, word.width, word.height);
            ctx.fillStyle = "black";
            ctx.fillText(word.text, word.x + word.width / 2, word.y + word.height / 2 + 5);
        }
    });
}

canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleStart(x, y);
});

canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleMove(x, y);
});

canvas.addEventListener("mouseup", () => {
    handleEnd();
});

canvas.addEventListener("touchstart", e => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleStart(x, y);
});

canvas.addEventListener("touchmove", e => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    e.preventDefault();
    handleMove(x, y);
});

canvas.addEventListener("touchend", () => {
    handleEnd();
});

function handleStart(x, y) {
    wordPositions.forEach(word => {
        if (!word.placed && x > word.x && x < word.x + word.width && y > word.y && y < word.y + word.height) {
            draggingWord = word;
            offsetX = x - word.x;
            offsetY = y - word.y;
            isDragging = true;
        }
    });
}

function handleMove(x, y) {
    if (isDragging && draggingWord) {
        draggingWord.x = x - offsetX;
        draggingWord.y = y - offsetY;
        draw();
    }
}

function handleEnd() {
    if (isDragging && draggingWord) {
        let placed = false;
        for (let pocket of pockets) {
            const centerX = draggingWord.x + draggingWord.width / 2;
            const centerY = draggingWord.y + draggingWord.height / 2;
            if (
                centerX > pocket.x &&
                centerX < pocket.x + pocket.width &&
                centerY > pocket.y &&
                centerY < pocket.y + pocket.height &&
                pocket.correctWords.includes(draggingWord.text) &&
                !pocket.words.some(w => w.text === draggingWord.text) &&
                pocket.words.length < pocket.maxRows
            ) {
                draggingWord.x = pocket.x + (pocket.width - draggingWord.width) / 2;
                draggingWord.y = pocket.y + 30 + pocket.words.length * (draggingWord.height + 2);
                pocket.words.push(draggingWord);
                draggingWord.placed = true;
                placed = true;
                break;
            }
        }
        if (!placed) {
            draggingWord.x = draggingWord.originalX;
            draggingWord.y = draggingWord.originalY;
        }
        draggingWord = null;
        isDragging = false;
        draw();
    }
}

initGame();
