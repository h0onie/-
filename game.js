const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 게임 모드 관리 변수
let practiceMode = false;

// 시작 화면 요소
const startScreen = document.getElementById("start-screen");
const practiceButton = document.getElementById("practice-mode");
const testButton = document.getElementById("test-mode");

// 스크롤 오프셋 추가
let scrollOffsetX = 0;
let scrollOffsetY = 0;

// 터치 스크롤 관련 변수
let isTouching = false;
let touchStartX = 0;
let touchStartY = 0;

// 게임 초기화 함수
function initGame() {
    wordPositions = [];
    pockets.forEach(pocket => pocket.words = []);
    draggingWord = null;
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

let wordPositions = [];
let draggingWord = null;
let offsetX = 0, offsetY = 0;
let gameCompleted = false;
let fadeAlpha = 0;

const pocketColors = {
    "[장애조기발견 선별검사]": "lightcoral",
    "[시각청각지체]": "lightseagreen",
    "[지적장애]": "lightgreen",
    "[정서행동자폐]": "lightyellow",
    "[의사소통]": "plum",
    "[학습장애]": "lightsalmon"
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-scrollOffsetX, -scrollOffsetY); // 스크롤 오프셋 반영

    ctx.fillStyle = "black";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("@h0onie Version 1.3.4", canvas.width / 2, 30);

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

    wordPositions.forEach(word => {
        if (!word.placed) {
            ctx.fillStyle = practiceMode ? getWordColor(word.text) : "lightblue";
            ctx.fillRect(word.x, word.y, word.width, word.height);
            ctx.strokeRect(word.x, word.y, word.width, word.height);
            ctx.fillStyle = "black";
            ctx.fillText(word.text, word.x + word.width / 2, word.y + word.height / 2 + 5);
        }
    });

    if (gameCompleted) {
        fadeAlpha += 0.01;
        if (fadeAlpha >= 1) fadeAlpha = 1;

        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 52px Arial";
        ctx.fillText("그냥 하는 사람이 부러웠어요-침착맨", canvas.width / 2, canvas.height / 2);

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

    ctx.restore();

    if (!gameCompleted || fadeAlpha < 1) {
        requestAnimationFrame(draw);
    }
}

const wordColorCache = {};
function getWordColor(wordText) {
    if (wordColorCache[wordText]) {
        return wordColorCache[wordText];
    }

    if (duplicateWords.includes(wordText)) {
        wordColorCache[wordText] = "lightblue";
        return "lightblue";
    }

    let wordColor = "lightblue";
    for (let pocket of pockets) {
        if (pocket.correctWords.includes(wordText)) {
            wordColor = pocketColors[pocket.label];
            break;
        }
    }

    wordColorCache[wordText] = wordColor;
    return wordColor;
}

function checkGameCompletion() {
    if (wordPositions.every(word => word.placed)) {
        console.log("All words placed: Game Completed!");
        gameCompleted = true;
    } else {
        console.log("Remaining words:", wordPositions.filter(word => !word.placed));
    }
}

function handleStart(x, y) {
    const adjustedX = x + scrollOffsetX; // 스크롤 오프셋 적용
    const adjustedY = y + scrollOffsetY;

    draggingWord = wordPositions.find(word =>
        adjustedX > word.x && adjustedX < word.x + word.width &&
        adjustedY > word.y && adjustedY < word.y + word.height &&
        !word.placed // 이미 배치된 단어는 클릭 불가
    );

    if (draggingWord) {
        offsetX = adjustedX - draggingWord.x;
        offsetY = adjustedY - draggingWord.y;
        isTouching = false; // 드래그 시작 시 스크롤 비활성화
    }
}


function handleMove(x, y) {
    if (draggingWord) {
        draggingWord.x = x - offsetX;
        draggingWord.y = y - offsetY;
    }
}

function handleEnd() {
    if (draggingWord) {
        let dropped = false;

        for (let pocket of pockets) {
            if (
                draggingWord.x + draggingWord.width / 2 > pocket.x &&
                draggingWord.x + draggingWord.width / 2 < pocket.x + pocket.width &&
                draggingWord.y + draggingWord.height / 2 > pocket.y &&
                draggingWord.y + draggingWord.height / 2 < pocket.y + pocket.height &&
                pocket.words.length < pocket.maxRows
            ) {
                const wordAlreadyInPocket = pocket.words.some(
                    word => word.text === draggingWord.text
                );

                if (!wordAlreadyInPocket && pocket.correctWords.includes(draggingWord.text)) {
                    draggingWord.x = pocket.x + (pocket.width - draggingWord.width) / 2;
                    draggingWord.y = pocket.y + 30 + pocket.words.length * (draggingWord.height + 2);

                    pocket.words.push({ ...draggingWord });
                    draggingWord.placed = true;
                    dropped = true;
                    break;
                }
            }
        }

        if (!dropped) {
            draggingWord.x = draggingWord.originalX;
            draggingWord.y = draggingWord.originalY;
        }

        draggingWord = null; // 드래그 중인 단어 초기화
        isTouching = true; // 스크롤 재활성화
        checkGameCompletion();
    }
}


canvas.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    handleStart(touch.clientX - rect.left + scrollOffsetX, touch.clientY - rect.top + scrollOffsetY);
    isTouching = true;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener("touchmove", e => {
    if (draggingWord) {
        // 단어를 드래그 중이라면 스크롤 동작 제한
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        handleMove(touch.clientX - rect.left, touch.clientY - rect.top); // 드래그 처리
        e.preventDefault(); // 스크롤 방지
    } else if (isTouching) {
        // 스크롤 동작 처리
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        scrollOffsetX -= deltaX;
        scrollOffsetY -= deltaY;

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        draw(); // 스크롤 상태로 다시 그리기
        e.preventDefault();
    }
});


canvas.addEventListener("touchend", () => {
    isTouching = false;
    handleEnd();
});

canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    handleStart(e.clientX - rect.left + scrollOffsetX, e.clientY - rect.top + scrollOffsetY);
});

canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    handleMove(e.clientX - rect.left + scrollOffsetX, e.clientY - rect.top + scrollOffsetY);
});

canvas.addEventListener("mouseup", () => {
    handleEnd();
});

// 마우스 휠 스크롤 처리
let isScrolling = false;

canvas.addEventListener("wheel", e => {
    if (!draggingWord) {
        // 드래그 중이 아닐 때만 스크롤 동작
        scrollOffsetY += e.deltaY;
        scrollOffsetX += e.deltaX;

        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
                draw(); // 스크롤된 상태로 다시 그리기
                isScrolling = false;
            });
        }
    }
    e.preventDefault(); // 스크롤 기본 동작 방지
});

