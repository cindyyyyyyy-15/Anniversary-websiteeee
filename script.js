// ==================== 恋爱计时器 ====================
const startDate = new Date(2025, 1, 24, 0, 0, 0); // 2025年2月24日

function updateTimer() {
    const now = new Date();
    const diff = now - startDate;
    if (diff < 0) return;

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const daysTotal = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(daysTotal / 365);
    const days = daysTotal % 365;

    document.getElementById('years').innerText = years;
    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;
}
setInterval(updateTimer, 1000);
updateTimer();

// ==================== 完美适配原生播放条 ====================
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const musicText = document.getElementById('musicText');

if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
        // 点击你漂浮的粉色按钮时，直接控制底下的原生音频播放
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicText.textContent = "正在播放 🎶";
                musicToggle.style.background = "#ffe3e8";
            }).catch(err => {
                alert("请直接点击页面上出现的音乐播放条上的【播放】按钮哦！");
            });
        } else {
            bgMusic.pause();
            musicText.textContent = "播放《玻璃》";
            musicToggle.style.background = "rgba(255, 255, 255, 0.9)";
        }
    });
}

// ==================== 刮刮乐与解锁逻辑 ====================
let clearedCardsCount = 0;
const totalCards = 3;
let isUnlocked = false;

function initScratchCards() {
    const cards = document.querySelectorAll('.scratch-card');

    cards.forEach(card => {
        const canvas = card.querySelector('.scratch-canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const rect = card.getBoundingClientRect();
        canvas.width = rect.width || 260;
        canvas.height = rect.height || 320;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#d1d8e0');
        gradient.addColorStop(0.5, '#a5b1c2');
        gradient.addColorStop(1, '#778ca3');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('🎁 刮一刮看惊喜', canvas.width / 2, canvas.height / 2);

        let isDrawing = false;
        let cardCleared = false;

        function checkScratchPercentage() {
            if (cardCleared) return;

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;

            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparentPixels++;
            }

            const percent = (transparentPixels / (pixels.length / 4)) * 100;

            if (percent > 35) {
                cardCleared = true;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                clearedCardsCount++;
                
                if (clearedCardsCount >= totalCards && !isUnlocked) {
                    unlockNextSection();
                }
            }
        }

        function scratch(e) {
            if (!isDrawing) return;
            const bounds = canvas.getBoundingClientRect();
            let x = (e.touches ? e.touches[0].clientX : e.clientX) - bounds.left;
            let y = (e.touches ? e.touches[0].clientY : e.clientY) - bounds.top;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fill();

            checkScratchPercentage();
        }

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseleave', () => { isDrawing = false; });

        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('touchmove', (e) => { scratch(e); e.preventDefault(); });
        canvas.addEventListener('touchend', () => { isDrawing = false; });
    });
}

function unlockNextSection() {
    isUnlocked = true;
    const lockedSection = document.getElementById('lockedSection');
    lockedSection.classList.add('unlocked');

    setTimeout(() => {
        lockedSection.scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// ==================== 互动 1：拍立得大图放大预览 ====================
function initImageZoom() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.getElementById('modalClose');

    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImg.src = img.src;
            modalCaption.innerText = img.alt || "我们的甜蜜回忆";
        });
    });

    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// ==================== 互动 2：默契问答小测试 ====================
const quizData = [
    {
        question: "1. 我们的两周年纪念日是哪一天？",
        options: ["2月24日", "5月20日", "8月14日", "1月15日"],
        answer: 0
    },
    {
        question: "2. 每次一起出去玩，谁最容易玩嗨？",
        options: ["我（女朋友）", "你（男朋友）", "两个人一起嗨", "看情况~"],
        answer: 2
    },
    {
        question: "3. 未来两周年后，我们还要一起走多久？",
        options: ["一万年", "一辈子", "一直一直走下去", "以上都是 ❤️"],
        answer: 3
    }
];

let currentQuizIndex = 0;

function loadQuizQuestion() {
    const q = quizData[currentQuizIndex];
    document.getElementById('quizQuestion').innerText = q.question;
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    q.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.innerText = optText;
        btn.addEventListener('click', () => handleQuizAnswer(index));
        optionsContainer.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex) {
    const feedback = document.getElementById('quizFeedback');
    const q = quizData[currentQuizIndex];

    if (selectedIndex === q.answer) {
        feedback.className = 'quiz-feedback correct';
        feedback.innerText = "✨ 答对啦！真棒！";

        setTimeout(() => {
            feedback.innerText = "";
            currentQuizIndex++;
            if (currentQuizIndex < quizData.length) {
                loadQuizQuestion();
            } else {
                document.getElementById('quizQuestion').innerText = "🎉 默契满分！所有问答均已通关！";
                document.getElementById('quizOptions').innerHTML = "";
                document.getElementById('letterSection').classList.remove('hidden-element');
                document.getElementById('letterSection').scrollIntoView({ behavior: 'smooth' });
            }
        }, 800);
    } else {
        feedback.className = 'quiz-feedback wrong';
        feedback.innerText = "❌ 答错啦，再好好想想哦～";
    }
}

// ==================== 互动 3：会逃跑的拒绝按钮 ====================
function initFleeingButton() {
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const card = document.querySelector('.proposal-card');
    const alertBox = document.getElementById('sweetAlert');
    const closeAlertBtn = document.getElementById('closeAlertBtn');

    noBtn.style.right = '120px';

    function flee() {
        const cardRect = card.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        const maxX = cardRect.width - btnRect.width - 20;
        const maxY = cardRect.height - btnRect.height - 20;

        const randomX = Math.max(10, Math.floor(Math.random() * maxX));
        const randomY = Math.max(10, Math.floor(Math.random() * maxY));

        noBtn.style.position = 'absolute';
        noBtn.style.left = randomX + 'px';
        noBtn.style.top = randomY + 'px';
    }

    noBtn.addEventListener('mouseenter', flee);
    noBtn.addEventListener('touchstart', (e) => { flee(); e.preventDefault(); });

    yesBtn.addEventListener('click', () => {
        alertBox.style.display = 'flex';
    });

    closeAlertBtn.addEventListener('click', () => {
        alertBox.style.display = 'none';
    });
}

// ==================== 背景动画：爱心与星星闪烁飘落 ====================
const symbols = ['💖', '✨', '⭐', '❤️', '🌟', '💕'];

function createMagicElements() {
    const el = document.createElement('div');
    el.classList.add('magic-element');
    
    el.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
    
    const size = Math.random() * 14 + 12 + 'px';
    el.style.fontSize = size;
    el.style.left = Math.random() * window.innerWidth + 'px';
    el.style.animationDuration = (Math.random() * 3 + 3) + 's';
    
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.remove();
    }, 6000);
}

setInterval(createMagicElements, 350);

// ==================== 初始化触发 ====================
window.addEventListener('load', () => {
    initScratchCards();
    initImageZoom();
    loadQuizQuestion();
    initFleeingButton();
});