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

// Данные мест еды
const foodPlaces = [
    // === КОРПУС 1 ===
    {
        id: 1,
        building: 1,
        name: "Буфет",
        emoji: "🥐",
        description: "1 этаж",
        tag: "Выпечка",
        location: "Корпус 1, 1 этаж",
        hours: "8:00–17:00 ПН-ПТ",
        price: "~55₽",
        menu: "Свежая выпечка, салаты, сендвичи и пицца на перекус"
    },
    // === КОРПУС 3 ===
    {
        id: 2,
        building: 3,
        name: "Автомат с кофе",
        emoji: "☕",
        description: "2 этаж",
        tag: "Кофе",
        location: "Корпус 3, 2 этаж",
        hours: "Круглосуточно",
        price: "~55₽",
        menu: "Классика кофейных напитков и горячий шоколад"
    },
    {
        id: 3,
        building: 3,
        name: "Автомат со снеками",
        emoji: "🍫",
        description: "2 этаж",
        tag: "Снеки",
        location: "Корпус 3, 2 этаж",
        hours: "Круглосуточно",
        price: "55–70₽",
        menu: "Шоколадки, батончики и снеки для быстрого перекуса"
    },
    {
        id: 4,
        building: 3,
        name: "Буфет",
        emoji: "🍽️",
        description: "3 этаж",
        tag: "Дорого",
        location: "Корпус 3, 3 этаж",
        hours: "Неизвестно",
        price: "Выше среднего",
        menu: "Есть выбор, но цены кусаются. На любителя"
    },
    // === КОРПУС 5 ===
    {
        id: 5,
        building: 5,
        name: "Monkey Grinder",
        emoji: "🐵",
        description: "1 этаж",
        tag: "Топ ☕",
        location: "Корпус 5, 1 этаж",
        hours: "8:00–19:00 ПН-ПТ\n8:00–15:00 СБ",
        price: "80–230₽",
        menu: "Крафтовый кофе, авторские рафы, десерты. Must visit!"
    },
    {
        id: 6,
        building: 5,
        name: "КисРис",
        emoji: "🍚",
        description: "1 этаж",
        tag: "Обеды",
        location: "Корпус 5, 1 этаж",
        hours: "9:30–17:30 ПН-ПТ",
        price: "~75₽",
        menu: "Домашняя кухня: супы, горячее, гарниры. Сытно и недорого"
    },
    {
        id: 7,
        building: 5,
        name: "Буфет",
        emoji: "🥪",
        description: "2 этаж",
        tag: "Перекус",
        location: "Корпус 5, 2 этаж",
        hours: "Неизвестно",
        price: "32–150₽",
        menu: "Базовый перекус. Рядом есть варианты интереснее"
    },
    // === КОРПУС 6 ===
    {
        id: 8,
        building: 6,
        name: "Столовая",
        emoji: "🍽️",
        description: "1 этаж",
        tag: "Обеды",
        location: "Корпус 6, 1 этаж",
        hours: "9:00–16:00 ПН-ПТ",
        price: "~70₽",
        menu: "Полноценные обеды: первое, второе, салаты. Классика"
    },
    {
        id: 9,
        building: 6,
        name: "Буфет",
        emoji: "🍦",
        description: "1 этаж",
        tag: "Перекус",
        location: "Корпус 6, 1 этаж",
        hours: "Неизвестно",
        price: "40–105₽",
        menu: "Мороженое, выпечка, кофе. Для быстрого перекуса"
    },
    // === КОРПУС 7 ===
    {
        id: 10,
        building: 7,
        name: "Киты Еды",
        emoji: "🐋",
        description: "2 этаж",
        tag: "Ланч",
        location: "Корпус 7, 2 этаж",
        hours: "~9:00–15:00",
        price: "~100₽",
        menu: "Бизнес-ланч за 199₽, уютная атмосфера, чай с пряностями"
    },
    {
        id: 11,
        building: 7,
        name: "Автомат с кофе",
        emoji: "☕",
        description: "1 этаж",
        tag: "Кофе",
        location: "Корпус 7, 1 этаж",
        hours: "Круглосуточно",
        price: "40–60₽",
        menu: "Недорогой кофе на бегу"
    },
    // === КОРПУС 8 ===
    {
        id: 12,
        building: 8,
        name: "Столовая",
        emoji: "🍽️",
        description: "1 этаж",
        tag: "Обеды",
        location: "Корпус 8, 1 этаж",
        hours: "Неизвестно",
        price: "~65₽",
        menu: "Большой выбор: от завтраков до полноценных обедов"
    },
    {
        id: 13,
        building: 8,
        name: "Буфет",
        emoji: "🥤",
        description: "4 этаж",
        tag: "Перекус",
        location: "Корпус 8, 4 этаж",
        hours: "9:00–18:00 ПН-ПТ",
        price: "Дороговато",
        menu: "Готовая еда в контейнерах, напитки. Скромно"
    },
    {
        id: 14,
        building: 8,
        name: "Буфет",
        emoji: "🥤",
        description: "5 этаж",
        tag: "Перекус",
        location: "Корпус 8, 5 этаж",
        hours: "9:00–19:00 ПН-ПТ",
        price: "30–180₽",
        menu: "Выпечка, энергетики. Чуть лучше, чем на 4-м"
    },
    // === КОРПУС 12 ===
    {
        id: 15,
        building: 12,
        name: "Monkey Grinder",
        emoji: "🐵",
        description: "2 этаж",
        tag: "Топ ☕",
        location: "Корпус 12, 2 этаж",
        hours: "8:00–19:00 ПН-ПТ\n8:00–15:00 СБ",
        price: "80–230₽",
        menu: "Крафтовый кофе, авторские рафы, десерты. Must visit!"
    },
    {
        id: 16,
        building: 12,
        name: "Автомат",
        emoji: "🤖",
        description: "2 этаж",
        tag: "Быстро",
        location: "Корпус 12, 2 этаж",
        hours: "Круглосуточно",
        price: "25–109₽",
        menu: "Кофе и снеки из автомата. Всегда доступно"
    },
    {
        id: 17,
        building: 12,
        name: "Бар",
        emoji: "🍜",
        description: "3 этаж",
        tag: "Азия",
        location: "Корпус 12, 3 этаж",
        hours: "8:00–20:00 ПН-ПТ\n8:00–17:00 СБ",
        price: "~130₽",
        menu: "Азиатская кухня: том ям, поке, боулы. Вкусно и необычно"
    }
];

// Корпуса с едой
const foodBuildings = [
    { id: 1, name: "Корпус 1", emoji: "1️⃣", count: 1 },
    { id: 3, name: "Корпус 3", emoji: "3️⃣", count: 3 },
    { id: 5, name: "Корпус 5", emoji: "5️⃣", count: 3, popular: true },
    { id: 6, name: "Корпус 6", emoji: "6️⃣", count: 2 },
    { id: 7, name: "Корпус 7", emoji: "7️⃣", count: 2 },
    { id: 8, name: "Корпус 8", emoji: "8️⃣", count: 3 },
    { id: 12, name: "Корпус 12", emoji: "🔟", count: 3, popular: true }
];

let selectedFoodBuilding = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderEntrances();
    renderBuildings();
    renderFoodBuildings();
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

function renderFoodBuildings() {
    const container = document.getElementById('food-buildings-list');
    container.innerHTML = foodBuildings.map(b => `
        <div class="food-building-card ${b.popular ? 'popular' : ''}" onclick="selectFoodBuilding(${b.id})">
            <div class="food-building-emoji">${b.emoji}</div>
            <div class="food-building-info">
                <h3>${b.name}</h3>
                <p>${b.count} ${b.count === 1 ? 'место' : (b.count < 5 ? 'места' : 'мест')}</p>
            </div>
            ${b.popular ? '<span class="popular-badge">🔥 Популярное</span>' : ''}
        </div>
    `).join('');
}

function selectFoodBuilding(buildingId) {
    selectedFoodBuilding = buildingId;
    const building = foodBuildings.find(b => b.id === buildingId);
    document.getElementById('food-building-title').textContent = building.name;
    renderFoodPlaces(buildingId);
    showStep('step-food-list');
    haptic();
}

function renderFoodPlaces(buildingId) {
    const container = document.getElementById('food-list');
    const places = foodPlaces.filter(p => p.building === buildingId);
    container.innerHTML = places.map(place => `
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
                <div class="info-value hours-value">${place.hours.replace(/\n/g, '<br>')}</div>
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

function goToFoodList() {
    showStep('step-food-list');
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

// Полноэкранный просмотр с нативным зумом
function openFullscreen() {
    const img = document.getElementById('route-image');
    if (!img.src) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.innerHTML = `
        <button class="fullscreen-close">✕</button>
        <div class="fullscreen-scroll">
            <img src="${img.src}" alt="Маршрут" class="fullscreen-img">
        </div>
        <div class="zoom-controls">
            <button class="zoom-btn" onclick="zoomIn()">+</button>
            <button class="zoom-btn" onclick="zoomOut()">−</button>
            <button class="zoom-btn" onclick="zoomReset()">↺</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    const closeBtn = overlay.querySelector('.fullscreen-close');
    closeBtn.onclick = () => overlay.remove();
    
    // Закрытие по тапу на фон (не на картинку)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('fullscreen-scroll')) {
            // Не закрываем при скролле
        }
    });
    
    window.currentZoom = 100;
    window.currentOverlay = overlay;
}

function zoomIn() {
    if (!window.currentOverlay) return;
    window.currentZoom = Math.min(window.currentZoom + 50, 300);
    updateZoom();
}

function zoomOut() {
    if (!window.currentOverlay) return;
    window.currentZoom = Math.max(window.currentZoom - 50, 100);
    updateZoom();
}

function zoomReset() {
    if (!window.currentOverlay) return;
    window.currentZoom = 100;
    updateZoom();
}

function updateZoom() {
    const img = window.currentOverlay.querySelector('.fullscreen-img');
    img.style.width = `${window.currentZoom}%`;
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
