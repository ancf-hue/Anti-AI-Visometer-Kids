// ========== БАЗА ДАННЫХ ИЗОБРАЖЕНИЙ (20 пар) ==========
// Реальные фото: images/real/1.jpg ... 20.jpg
// ИИ-генерации: images/ai/1.jpg ... 20.jpg

const imageDatabase = {
    easy: [
        { real: 'images/real/1.jpg', ai: 'images/ai/1.jpg', hint: '🔍 Обратите внимание на руки: у ИИ часто неправильное количество пальцев или неестественное их положение.' },
        { real: 'images/real/2.jpg', ai: 'images/ai/2.jpg', hint: '🔍 Посмотрите на глаза — у реальных людей отражения в зрачках симметричны и естественны.' },
        { real: 'images/real/3.jpg', ai: 'images/ai/3.jpg', hint: '🔍 Текст на заднем плане — слабое место нейросетей. Ищите нечитаемые надписи или искажённые буквы.' },
        { real: 'images/real/4.jpg', ai: 'images/ai/4.jpg', hint: '🔍 Зубы и уши: ИИ часто генерирует странные формы зубов или асимметричные ушные раковины.' },
        { real: 'images/real/5.jpg', ai: 'images/ai/5.jpg', hint: '🔍 Фон и детали: нейросети могут создавать повторяющиеся паттерны или невозможную геометрию.' },
        { real: 'images/real/6.jpg', ai: 'images/ai/6.jpg', hint: '🔍 Текстура кожи: у реальных фото есть поры, родинки, морщинки — у ИИ кожа часто слишком гладкая.' },
        { real: 'images/real/7.jpg', ai: 'images/ai/7.jpg', hint: '🔍 Блики и тени: нейросети часто путают направление света — ищите несоответствия.' }
    ],
    medium: [
        { real: 'images/real/8.jpg', ai: 'images/ai/8.jpg', hint: '🔍 Волосы: ИИ может создавать неестественные пряди, странные переходы цвета, "расплавленные" кончики.' },
        { real: 'images/real/9.jpg', ai: 'images/ai/9.jpg', hint: '🔍 Украшения и мелкие предметы: серьги, очки, пуговицы часто выдают нейросеть своей асимметрией.' },
        { real: 'images/real/10.jpg', ai: 'images/ai/10.jpg', hint: '🔍 Эмоции: у реальных людей мимика естественна — у ИИ улыбка может быть "стеклянной" или не затрагивать глаза.' },
        { real: 'images/real/11.jpg', ai: 'images/ai/11.jpg', hint: '🔍 Ракурс и перспектива: нейросети могут путать глубину и пропорции объектов.' },
        { real: 'images/real/12.jpg', ai: 'images/ai/12.jpg', hint: '🔍 Водяные знаки: на сгенерированных изображениях иногда остаются подписи нейросетей или артефакты.' },
        { real: 'images/real/13.jpg', ai: 'images/ai/13.jpg', hint: '🔍 Отражения в воде/зеркалах: ИИ очень сложно реалистично воспроизвести отражения.' }
    ],
    hard: [
        { real: 'images/real/14.jpg', ai: 'images/ai/14.jpg', hint: '🔍 Микротекстуры: присмотритесь к ткани одежды, рисунку обоев — нейросети часто создают неестественные повторения.' },
        { real: 'images/real/15.jpg', ai: 'images/ai/15.jpg', hint: '🔍 Анатомия тела: проверьте пропорции рук, ног, пальцев — самые частые ошибки ИИ.' },
        { real: 'images/real/16.jpg', ai: 'images/ai/16.jpg', hint: '🔍 Цветовая гамма: у ИИ иногда слишком насыщенные или неестественные цвета.' },
        { real: 'images/real/17.jpg', ai: 'images/ai/17.jpg', hint: '🔍 Артефакты сжатия: нейросети могут оставлять странные "пиксельные" шумы в определённых местах.' },
        { real: 'images/real/18.jpg', ai: 'images/ai/18.jpg', hint: '🔍 Двойные объекты: иногда ИИ создаёт лишние зубы, пальцы, предметы на заднем плане.' },
        { real: 'images/real/19.jpg', ai: 'images/ai/19.jpg', hint: '🔍 Контекст и логика: подумайте, могло ли такое происходить в реальности?' },
        { real: 'images/real/20.jpg', ai: 'images/ai/20.jpg', hint: '🔍 Симметрия лица: у реальных людей лица неидеально симметричны — у ИИ симметрия может быть слишком точной.' }
    ]
};

// Объединяем все сложности для 10 раундов
const allQuestions = [
    ...imageDatabase.easy.slice(0, 3),
    ...imageDatabase.medium.slice(0, 4),
    ...imageDatabase.hard.slice(0, 3)
];

// Состояние игры
let currentRound = 0;
let score = 0;
let currentDifficulty = 'easy';
let realPosition = 0; // 0 = левая картинка реальная, 1 = правая реальная
let currentQuestions = [];

// DOM элементы
let startScreen, gameScreen, feedbackScreen, resultScreen;
let progressEl, scoreEl, difficultyBadge;
let img0, img1;
let feedbackTitle, feedbackText, feedbackIcon;
let finalRank, finalPercent, finalScore, finalDesc;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Элементы
    startScreen = document.getElementById('start-screen');
    gameScreen = document.getElementById('game-screen');
    feedbackScreen = document.getElementById('feedback-screen');
    resultScreen = document.getElementById('result-screen');
    
    progressEl = document.getElementById('progress');
    scoreEl = document.getElementById('score');
    difficultyBadge = document.getElementById('difficulty-badge');
    
    img0 = document.getElementById('img0');
    img1 = document.getElementById('img1');
    
    feedbackTitle = document.getElementById('feedback-title');
    feedbackText = document.getElementById('feedback-text');
    feedbackIcon = document.getElementById('feedback-icon');
    
    finalRank = document.getElementById('final-rank');
    finalPercent = document.getElementById('final-percent');
    finalScore = document.getElementById('final-score');
    finalDesc = document.getElementById('final-desc');
    
    // Обработчики выбора сложности
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.diff;
            updateDifficultyBadge();
        });
    });
    
    // Кнопка старта
    document.getElementById('startBtn').addEventListener('click', startGame);
    
    // Обработчики выбора изображения
    document.querySelectorAll('.img-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const choice = parseInt(card.dataset.choice);
            if (!isNaN(choice)) makeChoice(choice);
        });
    });
    
    // Кнопка следующего раунда
    document.getElementById('nextBtn').addEventListener('click', nextRound);
    
    // Кнопка рестарта
    document.getElementById('restartBtn').addEventListener('click', () => location.reload());
    
    // Кнопка поделиться
    document.getElementById('shareBtn').addEventListener('click', shareResult);
});

function updateDifficultyBadge() {
    const badges = { easy: '🟢 Лёгкий', medium: '🟡 Средний', hard: '🔴 Сложный' };
    difficultyBadge.textContent = badges[currentDifficulty] || '🟢 Лёгкий';
}

function startGame() {
    // Перемешиваем вопросы
    currentQuestions = [...allQuestions];
    for (let i = currentQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQuestions[i], currentQuestions[j]] = [currentQuestions[j], currentQuestions[i]];
    }
    currentQuestions = currentQuestions.slice(0, 10);
    
    currentRound = 0;
    score = 0;
    
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    updateScore();
    loadRound();
}

function loadRound() {
    if (currentRound >= currentQuestions.length) {
        showResults();
        return;
    }
    
    const question = currentQuestions[currentRound];
    
    // Случайное расположение реального изображения
    realPosition = Math.random() < 0.5 ? 0 : 1;
    
    if (realPosition === 0) {
        img0.src = question.real;
        img1.src = question.ai;
    } else {
        img0.src = question.ai;
        img1.src = question.real;
    }
    
    progressEl.textContent = `Раунд ${currentRound + 1}/${currentQuestions.length}`;
    
    // Сброс стилей карточек
    document.querySelectorAll('.img-card').forEach(card => {
        card.style.borderColor = 'transparent';
    });
    
    gameScreen.classList.remove('hidden');
    feedbackScreen.classList.add('hidden');
}

function makeChoice(choice) {
    const isCorrect = (choice === realPosition);
    
    if (isCorrect) {
        score++;
        updateScore();
        
        feedbackIcon.textContent = '✅';
        feedbackTitle.textContent = 'ПРАВИЛЬНО!';
        feedbackTitle.style.color = 'var(--correct)';
    } else {
        feedbackIcon.textContent = '❌';
        feedbackTitle.textContent = 'ОШИБКА!';
        feedbackTitle.style.color = 'var(--wrong)';
    }
    
    const question = currentQuestions[currentRound];
    feedbackText.innerHTML = `<strong>📖 Обучение:</strong> ${question.hint}<br><br><em>Подсказка: тренируйте глаз и обращайте внимание на мелкие детали!</em>`;
    
    // Добавляем визуальную индикацию
    const selectedCard = document.querySelector(`.img-card[data-choice="${choice}"]`);
    if (selectedCard) {
        selectedCard.style.borderColor = isCorrect ? 'var(--correct)' : 'var(--wrong)';
        selectedCard.style.boxShadow = `0 0 20px ${isCorrect ? 'var(--correct)' : 'var(--wrong)'}`;
    }
    
    gameScreen.classList.add('hidden');
    feedbackScreen.classList.remove('hidden');
}

function updateScore() {
    scoreEl.textContent = `🎯 Счёт: ${score}`;
}

function nextRound() {
    currentRound++;
    loadRound();
}

function showResults() {
    const percent = Math.round((score / currentQuestions.length) * 100);
    let rank = '';
    let rankIcon = '';
    let description = '';
    
    if (percent >= 90) {
        rankIcon = '🏆';
        rank = 'Эксперт';
        description = 'Вы отлично различаете дипфейки! Ваш глаз тренирован, а внимание к деталям — на высоте. Такой уровень позволяет вам уверенно ориентироваться в мире визуального контента и не попадаться на уловки нейросетей.';
    } else if (percent >= 70) {
        rankIcon = '👍';
        rank = 'Продвинутый';
        description = 'Хороший результат! Вы замечаете большинство артефактов ИИ, но иногда ошибаетесь на сложных изображениях. Продолжайте тренироваться — и вскоре вы станете настоящим экспертом.';
    } else if (percent >= 50) {
        rankIcon = '📚';
        rank = 'Ученик';
        description = 'Вы на правильном пути, но нейросети всё ещё могут вас обманывать. Изучайте типичные артефакты ИИ: неправильные руки, странные глаза, неестественные текстуры. С каждой тренировкой ваш навык будет расти!';
    } else {
        rankIcon = '⚠️';
        rank = 'В группе риска';
        description = 'Вы уязвимы для визуальных дипфейков. Злоумышленники могут использовать сгенерированные ИИ изображения для обмана. Срочно тренируйте внимательность! Обращайте внимание на мелкие детали: глаза, руки, текст на заднем плане, тени и отражения.';
    }
    
    finalRank.innerHTML = `${rankIcon} ${rank}`;
    finalPercent.textContent = `${percent}%`;
    finalScore.textContent = `${score} из ${currentQuestions.length}`;
    finalDesc.textContent = description;
    
    // Дополнительная рекомендация
    if (percent < 70) {
        finalDesc.innerHTML += `<br><br><strong>🎯 Рекомендация:</strong> Пройдите тест ещё раз или начните с лёгкого уровня сложности.`;
    } else if (percent >= 90) {
        finalDesc.innerHTML += `<br><br><strong>💎 Совет:</strong> Попробуйте пройти тест на максимальной сложности — это отличная тренировка для профессионалов!`;
    }
    
    feedbackScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
}

function shareResult() {
    const percent = Math.round((score / currentQuestions.length) * 100);
    const text = `Я прошёл тест "Анти-ИИ Визометр" и набрал ${score}/10 (${percent}%)! Проверь и ты свою способность отличать реальность от нейросетей →`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Анти-ИИ Визометр',
            text: text,
            url: window.location.href
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Результат скопирован в буфер обмена! Поделитесь с друзьями.');
    }).catch(() => {
        alert('Не удалось скопировать результат.');
    });
}