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

// Загрузка данных пользователя из Telegram
function loadUserData() {
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        
        // Устанавливаем имя пользователя
        const userName = user.first_name || user.username || 'Пользователь';
        document.getElementById('user-name').textContent = userName;
        
        // Устанавливаем аватар (если есть)
        if (user.photo_url) {
            const avatarContainer = document.getElementById('user-avatar');
            avatarContainer.innerHTML = `<img src="${user.photo_url}" alt="Avatar">`;
        }
        
        // TODO: Загрузка токенов и рейтинга с сервера
        // Пока что используем заглушки
        document.getElementById('user-tokens').textContent = '0';
        document.getElementById('user-rating').textContent = '0';
    } else {
        // Если нет данных Telegram (тестирование в браузере)
        document.getElementById('user-name').textContent = 'Тестовый пользователь';
        document.getElementById('user-tokens').textContent = '0';
        document.getElementById('user-rating').textContent = '0';
    }
}

// Проверка: если возвращаемся с другой страницы - скрыть splash screen
if (sessionStorage.getItem('visited')) {
    const splash = document.getElementById('splash');
    if (splash) {
        splash.style.display = 'none';
    }
} else {
    sessionStorage.setItem('visited', 'true');
}

// Проверка: если нужно показать серпантин
if (sessionStorage.getItem('showConfetti') === 'true') {
    sessionStorage.removeItem('showConfetti');
    // Показываем серпантин после загрузки страницы
    setTimeout(() => {
        showConfetti();
    }, 100);
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
    loadUserData();
    createParticles();
    initSwipeGesture();
    renderLeaderboard();
});

// Протягивание плашки пальцем (вверх и вниз)
function initSwipeGesture() {
    const profileCard = document.getElementById('user-profile-card');
    const darkOverlay = document.getElementById('dark-overlay');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let startBottom = 0; // начальная позиция плашки
    
    const screenHeight = window.innerHeight;
    const maxBottom = screenHeight - 120; // calc(100vh - 120px)
    const minBottom = 20;
    const cardHeight = 90; // примерная высота плашки

    profileCard.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        currentY = startY;
        isDragging = true;
        
        // Запоминаем текущую позицию плашки
        const isLifted = profileCard.classList.contains('lifted');
        startBottom = isLifted ? maxBottom : minBottom;
        
        // Убираем transition для плавного следования за пальцем
        profileCard.style.transition = 'none';
        darkOverlay.style.transition = 'none';
    });

    profileCard.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        
        currentY = e.touches[0].clientY;
        const deltaY = startY - currentY; // положительное = вверх, отрицательное = вниз
        
        // Вычисляем новую позицию плашки
        let newBottom = startBottom + deltaY;
        
        // Ограничиваем диапазон
        if (newBottom < minBottom) newBottom = minBottom;
        if (newBottom > maxBottom) newBottom = maxBottom;
        
        // Двигаем плашку
        profileCard.style.bottom = newBottom + 'px';
        
        // Overlay всегда приклеен к нижней грани плашки
        // top = высота экрана - bottom плашки (от низа экрана до низа плашки)
        const overlayTop = screenHeight - newBottom;
        darkOverlay.style.top = overlayTop + 'px';
        
        // Показываем overlay когда плашка поднимается
        const progress = (newBottom - minBottom) / (maxBottom - minBottom);
        if (progress > 0.05) {
            darkOverlay.style.opacity = '1';
            darkOverlay.style.visibility = 'visible';
        } else {
            darkOverlay.style.opacity = '0';
            darkOverlay.style.visibility = 'hidden';
        }
        
        // Показываем/скрываем стрелочки
        if (newBottom > minBottom + 50) {
            profileCard.querySelector('.swipe-indicator').style.opacity = '0';
        } else {
            profileCard.querySelector('.swipe-indicator').style.opacity = '1';
        }
    });

    profileCard.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        // Возвращаем transition
        profileCard.style.transition = 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        darkOverlay.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s';
        
        const deltaY = startY - currentY;
        
        // Если протянули больше чем на 20% экрана - открываем/закрываем полностью
        if (Math.abs(deltaY) > screenHeight * 0.2) {
            if (deltaY > 0) {
                // Протянули вверх - открываем
                openOverlay();
            } else {
                // Протянули вниз - закрываем
                closeOverlay();
            }
        } else {
            // Иначе возвращаем в исходное состояние
            const isLifted = profileCard.classList.contains('lifted');
            if (isLifted) {
                openOverlay(); // Возвращаем наверх
            } else {
                closeOverlay(); // Возвращаем вниз
            }
        }
    });

    // Отменяем touchcancel
    profileCard.addEventListener('touchcancel', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        // Возвращаем transition
        profileCard.style.transition = 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        darkOverlay.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s';
        
        // Возвращаем в исходное состояние
        const isLifted = profileCard.classList.contains('lifted');
        if (isLifted) {
            openOverlay();
        } else {
            closeOverlay();
        }
    });
}

function openOverlay() {
    const profileCard = document.getElementById('user-profile-card');
    const darkOverlay = document.getElementById('dark-overlay');
    
    // Убираем inline стили только у плашки
    profileCard.style.bottom = '';
    // НЕ очищаем darkOverlay.style.top - пусть анимируется от текущей позиции
    
    // Форсируем reflow для корректной анимации
    profileCard.offsetHeight;
    
    // Одновременно поднимаем плашку и открываем меню
    requestAnimationFrame(() => {
        profileCard.classList.add('lifted');
        darkOverlay.classList.add('active');
    });
    
    profileCard.style.cursor = 'default';
    
    haptic();
}

function closeOverlay() {
    const profileCard = document.getElementById('user-profile-card');
    const darkOverlay = document.getElementById('dark-overlay');
    
    // Убираем inline стили
    profileCard.style.bottom = '';
    darkOverlay.style.top = '';
    darkOverlay.style.opacity = '';
    darkOverlay.style.visibility = '';
    
    profileCard.classList.remove('lifted');
    darkOverlay.classList.remove('active');
    
    profileCard.style.cursor = 'pointer';
    
    haptic();
}

function openLeaderboard() {
    const overlayContent = document.querySelector('.overlay-content');
    const leaderboardView = document.getElementById('step-leaderboard');
    
    // 1. Скрываем контент меню плавно
    overlayContent.classList.add('hiding');
    
    // 2. Через 300ms показываем лидерборд
    setTimeout(() => {
        leaderboardView.classList.add('active');
    }, 300);
    
    haptic();
}

function closeLeaderboard() {
    const leaderboardView = document.getElementById('step-leaderboard');
    const overlayContent = document.querySelector('.overlay-content');
    
    // 1. Скрываем лидерборд
    leaderboardView.classList.remove('active');
    
    // 2. Через 300ms показываем контент меню
    setTimeout(() => {
        overlayContent.classList.remove('hiding');
    }, 300);
    
    haptic();
}

// Создание частиц для конкретного контейнера
function createParticlesForContainer(container) {
    const particleCount = 20;
    const colors = [
        'rgba(135, 206, 250, 0.4)',
        'rgba(173, 216, 230, 0.35)',
        'rgba(176, 224, 230, 0.3)',
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 2.5 + 1.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = Math.random() * 8 + 12;
        const delay = Math.random() * 5;
        
        const moveX = (Math.random() - 0.5) * 40;
        const moveY = (Math.random() - 0.5) * 30;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${startX}%;
            top: ${startY}%;
            animation: gentleFloat ${duration}s infinite ease-in-out;
            animation-delay: ${delay}s;
            box-shadow: 0 0 ${size * 3}px ${color};
            pointer-events: none;
            --move-x: ${moveX}px;
            --move-y: ${moveY}px;
        `;
        
        container.appendChild(particle);
    }
}

// Генерация таблицы лидеров (заглушка с тестовыми данными)
function renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    
    // Тестовые данные (потом заменишь на реальные с сервера)
    const leaders = [];
    for (let i = 1; i <= 50; i++) {
        leaders.push({
            rank: i,
            name: `Пользователь ${i}`,
            rating: 5000 - (i * 50) + Math.floor(Math.random() * 40),
            avatar: null
        });
    }
    
    container.innerHTML = leaders.map(leader => {
        let medal = '';
        let rankClass = '';
        
        if (leader.rank === 1) {
            medal = '💎';
            rankClass = 'rank-1';
        } else if (leader.rank === 2) {
            medal = '🥇';
            rankClass = 'rank-2';
        } else if (leader.rank === 3) {
            medal = '🥈';
            rankClass = 'rank-3';
        }
        
        return `
            <div class="leader-item ${rankClass}">
                <div class="leader-rank">${leader.rank}</div>
                ${medal ? `<div class="leader-medal">${medal}</div>` : ''}
                <div class="leader-avatar">
                    ${leader.avatar ? 
                        `<img src="${leader.avatar}" alt="Avatar">` : 
                        '<div class="leader-avatar-placeholder">👤</div>'
                    }
                </div>
                <div class="leader-info">
                    <div class="leader-name">${leader.name}</div>
                    <div class="leader-rating">
                        <span class="leader-rating-icon">⭐</span>
                        <span class="leader-rating-value">${leader.rating}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Создание анимированных частиц для профиля
function createParticles() {
    const particlesContainer = document.querySelector('.particles-bg');
    if (!particlesContainer) return;
    
    const particleCount = 20;
    const colors = [
        'rgba(135, 206, 250, 0.4)',
        'rgba(173, 216, 230, 0.35)',
        'rgba(176, 224, 230, 0.3)',
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 2.5 + 1.5; // 1.5-4px
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = Math.random() * 8 + 12; // 12-20s - медленно
        const delay = Math.random() * 5;
        
        // Случайное направление движения
        const moveX = (Math.random() - 0.5) * 40; // -20 до 20
        const moveY = (Math.random() - 0.5) * 30; // -15 до 15
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${startX}%;
            top: ${startY}%;
            animation: gentleFloat ${duration}s infinite ease-in-out;
            animation-delay: ${delay}s;
            box-shadow: 0 0 ${size * 3}px ${color};
            pointer-events: none;
            --move-x: ${moveX}px;
            --move-y: ${moveY}px;
        `;
        
        particlesContainer.appendChild(particle);
    }
}


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

function goToMap() {
    window.location.href = 'map.html';
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

function goToFAQ() {
    showStep('step-faq');
    haptic();
}

function goToShop() {
    // TODO: Реализовать магазин кастомизации
    if (tg?.showAlert) {
        tg.showAlert('Магазин кастомизации скоро откроется! 🎨');
    }
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
