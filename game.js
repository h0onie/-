const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 게임 모드 관리 변수
let practiceMode = false;

// 시작 화면 요소
const startScreen = document.getElementById("start-screen");
const practiceButton = document.getElementById("practice-mode");
const testButton = document.getElementById("test-mode");

// 게임 초기화 함수
function initGame() {
    // 기존에 게임이 진행 중이었다면 초기화
    wordPositions = [];
    pockets.forEach(pocket => pocket.words = []);
    draggingWord = null;
    gameCompleted = false;
    fadeAlpha = 0;

    // 단어 목록 초기화 및 섞기
    shuffle(words);

    // 단어 위치 설정
    wordPositions = [];
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

    // 게임 화면 표시
    canvas.style.display = "block";
    startScreen.style.display = "none";

    draw();
}

// 모드 선택 버튼 이벤트 리스너
practiceButton.addEventListener("click", () => {
    practiceMode = true;
    initGame();
});

testButton.addEventListener("click", () => {
    practiceMode = false;
    initGame();
});

// 기존 게임 코드 시작
canvas.width = 1560;
canvas.height = 800;

// Define pockets with corresponding words
const pockets = [
    { x: 50, y: 50, width: 200, height: 255, label: "[장애조기발견 선별검사]", correctWords: ["사회성숙도검사", "적응행동검사", "영유아발달검사"], words: [], maxRows: 6 },
    { x: 50, y: 400, width: 200, height: 255, label: "[시각청각지체]", correctWords: ["기초학습기능검사", "시력검사", "시기능/촉기능검사", "청력검사"], words: [], maxRows: 6 },
    { x: 300, y: 50, width: 200, height: 255, label: "[지적장애]", correctWords: ["지능검사", "사회성숙도검사", "적응행동검사", "기초학습검사", "운동능력검사"], words: [], maxRows: 6 },
    { x: 300, y: 400, width: 200, height: 255, label: "[정서행동자폐]", correctWords: ["적응행동검사", "성격진단검사", "행동발달평가", "학습준비도검사"], words: [], maxRows: 6 },
    { x: 550, y: 50, width: 200, height: 255, label: "[의사소통]", correctWords: ["구문검사", "음운검사", "언어발달검사"], words: [], maxRows: 6 },
    { x: 550, y: 400, width: 200, height: 255, label: "[학습장애]", correctWords: ["지능검사", "기초학습기능검사", "학습준비도검사", "시지각발달검사", "지각운동발달검사", "시각운동통합발달검사"], words: [], maxRows: 6 }
];

// 단어 목록
const words = [
    "사회성숙도검사", "사회성숙도검사", "적응행동검사", "적응행동검사", "적응행동검사",
    "영유아발달검사", "기초학습기능검사", "기초학습기능검사", "시력검사", "시기능/촉기능검사",
    "청력검사", "지능검사", "지능검사", "기초학습검사", 
    "운동능력검사", "성격진단검사", "행동발달평가", "학습준비도검사", "학습준비도검사", "구문검사",
    "음운검사", "언어발달검사", "시지각발달검사", "지각운동발달검사", "시각운동통합발달검사"
];

// 중복된 단어 리스트
const duplicateWords = ["사회성숙도검사", "적응행동검사", "지능검사", "기초학습기능검사", "학습준비도검사"];

// Fisher-Yates Shuffle로 배열 랜덤 섞기
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap
    }
}

let wordPositions = [];
let draggingWord = null;
let offsetX = 0, offsetY = 0;

// Game completion flag
let gameCompleted = false;
let fadeAlpha = 0;

// Practice mode 색상 설정
const pocketColors = {
    "[장애조기발견 선별검사]": "lightcoral",
    "[시각청각지체]": "lightseagreen",
    "[지적장애]": "lightgreen",
    "[정서행동자폐]": "lightyellow",
    "[의사소통]": "plum",
    "[학습장애]": "lightsalmon"
};

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game message
    ctx.fillStyle = "black";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("@h0onie", canvas.width / 2, 30);

    // Draw pockets
    pockets.forEach(pocket => {
        ctx.fillStyle = "lightgray";
        ctx.fillRect(pocket.x, pocket.y, pocket.width, pocket.height);
        ctx.strokeRect(pocket.x, pocket.y, pocket.width, pocket.height);
        ctx.fillStyle = "black";
        ctx.font = "bold 14px Arial";
        ctx.fillText(pocket.label, pocket.x + pocket.width / 2, pocket.y + 20);

        pocket.words.forEach((word, index) => {
            const wordY = pocket.y + 30 + index * (word.height + 2);
            ctx.fillStyle = practiceMode ? getWordColor(word.text) : "lightblue";
            ctx.fillRect(pocket.x + (pocket.width - word.width) / 2, wordY, word.width, word.height);
            ctx.strokeRect(pocket.x + (pocket.width - word.width) / 2, wordY, word.width, word.height);
            ctx.fillStyle = "black";
            ctx.fillText(word.text, pocket.x + pocket.width / 2, wordY + word.height / 2 + 5);
        });
    });

    // Draw draggable words
    wordPositions.forEach(word => {
        if (!word.placed) {
            ctx.fillStyle = practiceMode ? getWordColor(word.text) : "lightblue";
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

        // Draw Home Button
        const homeButtonX = canvas.width - 150;
        const homeButtonY = canvas.height - 50;
        ctx.fillStyle = "#007BFF";
        ctx.fillRect(homeButtonX, homeButtonY, 120, 40);
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("홈으로", homeButtonX + 60, homeButtonY + 25);

        canvas.addEventListener("click", function handleHomeClick(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (mouseX > homeButtonX && mouseX < homeButtonX + 120 && mouseY > homeButtonY && mouseY < homeButtonY + 40) {
                canvas.style.display = "none";
                startScreen.style.display = "flex";
                canvas.removeEventListener("click", handleHomeClick);
            }
        });
    }

    // 화면 업데이트를 위해 draw를 재호출
    if (!gameCompleted || fadeAlpha < 1) {
        requestAnimationFrame(draw);
    }
}

// 단어에 맞는 색상 반환 함수
const wordColorCache = {}; // 캐싱용 객체

function getWordColor(wordText) {
    // 캐싱된 값이 있으면 반환
    if (wordColorCache[wordText]) {
        return wordColorCache[wordText];
    }

    // 중복된 단어는 연파랑 처리
    if (duplicateWords.includes(wordText)) {
        wordColorCache[wordText] = "lightblue";
        return "lightblue";
    }

    // 기본 색 결정
    let wordColor = "lightblue";
    for (let pocket of pockets) {
        if (pocket.correctWords.includes(wordText)) {
            wordColor = pocketColors[pocket.label];
            break;
        }
    }

    // 계산 결과를 캐시에 저장
    wordColorCache[wordText] = wordColor;
    return wordColor;
}


// Check if all words are placed
function checkGameCompletion() {
    if (wordPositions.every(word => word.placed)) {
        console.log("All words placed: Game Completed!");
        gameCompleted = true;
    } else {
        console.log("Remaining words:", wordPositions.filter(word => !word.placed));
    }
}

// 터치 이벤트 헬퍼 함수
function getTouchPosition(canvas, touch) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

// 마우스와 터치를 모두 처리하는 이벤트
canvas.addEventListener("mousedown", (e) => {
    handleStart(e.offsetX, e.offsetY);
});
canvas.addEventListener("touchstart", (e) => {
    const touch = getTouchPosition(canvas, e.touches[0]);
    handleStart(touch.x, touch.y);
});

canvas.addEventListener("mousemove", (e) => {
    handleMove(e.offsetX, e.offsetY);
});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // 스크롤 방지
    const touch = getTouchPosition(canvas, e.touches[0]);
    handleMove(touch.x, touch.y);
});

canvas.addEventListener("mouseup", () => {
    handleEnd();
});
canvas.addEventListener("touchend", () => {
    handleEnd();
});

// 공통 로직
function handleStart(x, y) {
    wordPositions.forEach(word => {
        if (!word.placed && x > word.x && x < word.x + word.width &&
            y > word.y && y < word.y + word.height) {
            draggingWord = word;
            offsetX = x - word.x;
            offsetY = y - word.y;
        }
    });
}

function handleMove(x, y) {
    if (draggingWord) {
        draggingWord.x = x - offsetX;
        draggingWord.y = y - offsetY;
        draw();
    }
}

function handleEnd() {
    if (draggingWord) {
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
        checkGameCompletion();
        draw();
    }
}


// 초기에는 게임을 시작하지 않음
// draw();
