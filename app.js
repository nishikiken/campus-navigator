// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    
    // Применяем тему Telegram
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1c1c1e');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#8e8e93');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0a84ff');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#2c2c2e');
}

// API URL (поменяй на свой при деплое)
const API_URL = '';

// Состояние
let selectedEntrance = null;
let selectedBuilding = null;

// Данные
const entrances = {
    "1": { name: "Вход 1", description: "Западный", emoji: "🚪" },
    "2": { name: "Вход 2", description: "Главный", emoji: "🏛️" },
    "3": { name: "Вход 3", description: "Восточный", emoji: "🚶" }
};

const buildings = {};
for (let i = 1; i <= 12; i++) {
    buildings[i] = `Корпус ${i}`;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderEntrances();
    renderBuildings();
});

function renderEntrances() {
    const container = document.getElementById('entrances-list');
    container.innerHTML = Object.entries(entrances).map(([id, data]) => `
        <div class="entrance-card" onclick="selectEntrance('${id}')">
            <div class="emoji">${data.emoji}</div>
            <div class="info">
                <h3>${data.name}</h3>
                <p>${data.description}</p>
            </div>
        </div>
    `).join('');
}

function renderBuildings() {
    const container = document.getElementById('buildings-list');
    container.innerHTML = Object.entries(buildings).map(([id, name]) => `
        <div class="building-card" onclick="selectBuilding('${id}')">
            <div class="number">${id}</div>
            <div class="label">корпус</div>
        </div>
    `).join('');
}

function selectEntrance(id) {
    selectedEntrance = id;
    const data = entrances[id];
    document.getElementById('selected-entrance').textContent = `${data.name} (${data.description})`;
    showStep('step-building');
    
    // Haptic feedback
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

function selectBuilding(id) {
    selectedBuilding = id;
    loadRoute();
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

function loadRoute() {
    const img = document.getElementById('route-image');
    const loading = document.getElementById('loading');
    const title = document.getElementById('route-title');
    
    loading.classList.remove('hidden');
    title.textContent = `${entrances[selectedEntrance].name} → Корпус ${selectedBuilding}`;
    
    showStep('step-route');
    
    img.onload = () => {
        loading.classList.add('hidden');
    };
    
    img.onerror = () => {
        loading.innerHTML = '<p style="color: var(--tg-theme-hint-color)">Маршрут не найден</p>';
    };
    
    // Для GitHub Pages — прямой путь к картинкам
    img.src = `routes/${selectedEntrance}-${selectedBuilding}.png`;
}

// Увеличение картинки по клику
document.querySelector('.route-container')?.addEventListener('click', openFullscreen);

function openFullscreen() {
    const img = document.getElementById('route-image');
    if (!img.src) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.innerHTML = `
        <button class="fullscreen-close" onclick="this.parentElement.remove()">✕</button>
        <img src="${img.src}" alt="Маршрут">
    `;
    document.body.appendChild(overlay);
    
    // Двойной тап для закрытия
    let lastTap = 0;
    overlay.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            overlay.remove();
        }
        lastTap = now;
    });
}

function goBack() {
    showStep('step-entrance');
}

function goToBuildings() {
    showStep('step-building');
}

function arrived() {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    
    // Серпантин и возврат одновременно
    showConfetti();
    showStep('step-entrance');
}

function showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7', '#0a84ff', '#22c55e'];
    
    // Создаём 40 конфетти
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (1 + Math.random() * 0.5) + 's';
        container.appendChild(confetti);
    }
    
    // Удаляем контейнер после анимации
    setTimeout(() => container.remove(), 2000);
}

function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}
