// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1c1c1e');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#8e8e93');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0a84ff');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#2c2c2e');
}

// Состояние
let selectedEntrance = null;
let selectedBuilding = null;

// Данные входов
const entrances = {
    "1": { name: "Вход 1", description: "Западный", emoji: "🚪" },
    "2": { name: "Вход 2", description: "Главный", emoji: "🏛️" },
    "3": { name: "Вход 3", description: "Восточный", emoji: "🚶" }
};

// Данные корпусов
const buildings = {};
for (let i = 1; i <= 12; i++) {
    buildings[i] = `Корпус ${i}`;
}

// Данные мест еды (заполни своими данными!)
const foodPlaces = [
    {
        id: 1,
        name: "Столовая №1",
        emoji: "🍽️",
        description: "Корпус 1, 1 этаж",
        tag: "Дёшево",
        location: "Корпус 1",
        hours: "9:00 - 17:00",
        price: "150-250₽",
        menu: "Комплексные обеды, выпечка"
    },
    {
        id: 2,
        name: "Столовая №2",
        emoji: "🍽️",
        description: "Корпус 5, 2 этаж",
        tag: "Дёшево",
        location: "Корпус 5",
        hours: "9:00 - 16:00",
        price: "150-250₽",
        menu: "Комплексные обеды"
    },
    {
        id: 3,
        name: "Кафе 'Перемена'",
        emoji: "☕",
        description: "Корпус 3, 1 этаж",
        tag: "Кофе",
        location: "Корпус 3",
        hours: "8:00 - 18:00",
        price: "100-400₽",
        menu: "Кофе, сэндвичи, десерты"
    },
    {
        id: 4,
        name: "Буфет",
        emoji: "🥪",
        description: "Корпус 7, 1 этаж",
        tag: "Быстро",
        location: "Корпус 7",
        hours: "8:30 - 16:30",
        price: "50-150₽",
        menu: "Выпечка, напитки, снеки"
    },
    {
        id: 5,
        name: "Автоматы",
        emoji: "🤖",
        description: "Все корпуса",
        tag: "24/7",
        location: "Холлы корпусов",
        hours: "Круглосуточно",
        price: "50-200₽",
        menu: "Снеки, напитки, кофе"
    }
];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderEntrances();
    renderBuildings();
    renderFoodPlaces();
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

function renderFoodPlaces() {
    const container = document.getElementById('food-list');
    container.innerHTML = foodPlaces.map(place => `
        <div class="food-card" onclick="showFoodInfo(${place.id})">
            <div class="food-emoji">${place.emoji}</div>
            <div class="food-details">
                <h3>${place.name}</h3>
                <p>${place.description}</p>
            </div>
            <span class="food-tag">${place.tag}</span>
        </div>
    `).join('');
}

function showFoodInfo(id) {
    const place = foodPlaces.find(p => p.id === id);
    if (!place) return;
    
    document.getElementById('food-title').textContent = place.name;
    document.getElementById('food-info-content').innerHTML = `
        <div class="info-row">
            <span class="info-icon">📍</span>
            <div class="info-text">
                <div class="info-label">Где находится</div>
                <div class="info-value">${place.location}</div>
            </div>
        </div>
        <div class="info-row">
            <span class="info-icon">🕐</span>
            <div class="info-text">
                <div class="info-label">Время работы</div>
                <div class="info-value">${place.hours}</div>
            </div>
        </div>
        <div class="info-row">
            <span class="info-icon">💰</span>
            <div class="info-text">
                <div class="info-label">Средний чек</div>
                <div class="info-value">${place.price}</div>
            </div>
        </div>
        <div class="info-row">
            <span class="info-icon">🍴</span>
            <div class="info-text">
                <div class="info-label">Что есть</div>
                <div class="info-value">${place.menu}</div>
            </div>
        </div>
    `;
    showStep('step-food-info');
    haptic();
}

// Навигация
function goToMain() {
    showStep('step-main');
    haptic();
}

function goToEntrances() {
    showStep('step-entrance');
    haptic();
}

function goToFood() {
    showStep('step-food');
    haptic();
}

function goToBuildings() {
    showStep('step-building');
    haptic();
}

function selectEntrance(id) {
    selectedEntrance = id;
    const data = entrances[id];
    document.getElementById('selected-entrance').textContent = `${data.name} (${data.description})`;
    showStep('step-building');
    haptic();
}

function selectBuilding(id) {
    selectedBuilding = id;
    loadRoute();
    haptic();
}

function loadRoute() {
    const img = document.getElementById('route-image');
    const loading = document.getElementById('loading');
    const title = document.getElementById('route-title');
    
    loading.classList.remove('hidden');
    title.textContent = `${entrances[selectedEntrance].name} → Корпус ${selectedBuilding}`;
    
    showStep('step-route');
    
    img.onload = () => loading.classList.add('hidden');
    img.onerror = () => {
        loading.innerHTML = '<p style="color: var(--tg-theme-hint-color)">Маршрут не найден</p>';
    };
    
    img.src = `routes/${selectedEntrance}-${selectedBuilding}.png`;
}


function arrived() {
    haptic('success');
    showConfetti();
    showStep('step-main');
}

function showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7', '#0a84ff', '#22c55e'];
    
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (1 + Math.random() * 0.5) + 's';
        container.appendChild(confetti);
    }
    
    setTimeout(() => container.remove(), 2000);
}

// Полноэкранный просмотр с pinch-zoom
function openFullscreen() {
    const img = document.getElementById('route-image');
    if (!img.src) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.innerHTML = `
        <button class="fullscreen-close">✕</button>
        <div class="fullscreen-image-container">
            <img src="${img.src}" alt="Маршрут" id="zoomable-image">
        </div>
    `;
    document.body.appendChild(overlay);
    
    const closeBtn = overlay.querySelector('.fullscreen-close');
    closeBtn.onclick = () => overlay.remove();
    
    // Pinch-zoom логика
    const zoomImg = overlay.querySelector('#zoomable-image');
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastDist = 0;
    
    function updateTransform() {
        zoomImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }
    
    // Touch events
    zoomImg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            lastX = e.touches[0].clientX - posX;
            lastY = e.touches[0].clientY - posY;
        } else if (e.touches.length === 2) {
            lastDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    });
    
    zoomImg.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && scale > 1) {
            posX = e.touches[0].clientX - lastX;
            posY = e.touches[0].clientY - lastY;
            updateTransform();
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            if (lastDist > 0) {
                scale = Math.min(Math.max(scale * (dist / lastDist), 1), 5);
                updateTransform();
            }
            lastDist = dist;
        }
    });
    
    zoomImg.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) lastDist = 0;
        if (scale <= 1) {
            posX = 0;
            posY = 0;
            updateTransform();
        }
    });
    
    // Double tap to zoom
    let lastTap = 0;
    zoomImg.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300 && e.touches.length === 0) {
            if (scale > 1) {
                scale = 1;
                posX = 0;
                posY = 0;
            } else {
                scale = 2.5;
            }
            updateTransform();
        }
        lastTap = now;
    });
}

function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

function haptic(type = 'selection') {
    if (tg?.HapticFeedback) {
        if (type === 'success') {
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            tg.HapticFeedback.selectionChanged();
        }
    }
}
