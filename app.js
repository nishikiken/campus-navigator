// Supabase Configuration
const SUPABASE_URL = 'https://hyxyablgkjtoxcxnurkk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHlhYmxna2p0b3hjeG51cmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE5NjksImV4cCI6MjA4NDc1Nzk2OX0._3HQYSymZ2ArXIN143gAiwulCL1yt7i5fiHaTd4bp5U';

console.log('=== SCRIPT LOADED ===');
console.log('Supabase URL:', SUPABASE_URL);
console.log('window.supabase available:', !!window.supabase);

// Инициализация Supabase после загрузки библиотеки
let supabaseClient;
if (window.supabase) {
    console.log('Initializing Supabase...');
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized:', !!supabaseClient);
} else {
    console.error('Supabase library not loaded!');
}

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

// === ВСТРОЕННАЯ КОНСОЛЬ ДЛЯ ОТЛАДКИ ===
const debugLogs = [];
const maxLogs = 50;

function addDebugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    debugLogs.push({ message: logEntry, type });
    
    if (debugLogs.length > maxLogs) {
        debugLogs.shift();
    }
    
    updateDebugConsole();
}

function updateDebugConsole() {
    const consoleEl = document.getElementById('debug-console');
    if (!consoleEl) return;
    
    consoleEl.innerHTML = debugLogs.map(log => 
        `<div class="log-entry log-${log.type}">${log.message}</div>`
    ).join('');
    
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function toggleDebugConsole() {
    const consoleEl = document.getElementById('debug-console');
    if (consoleEl) {
        consoleEl.classList.toggle('active');
    }
}

// Делаем функцию глобальной чтобы работала из HTML
window.toggleDebugConsole = toggleDebugConsole;

// Перехватываем console.log, console.error, console.warn
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function(...args) {
    addDebugLog(args.join(' '), 'info');
    originalLog.apply(console, args);
};

console.error = function(...args) {
    addDebugLog('ERROR: ' + args.join(' '), 'error');
    originalError.apply(console, args);
};

console.warn = function(...args) {
    addDebugLog('WARN: ' + args.join(' '), 'warn');
    originalWarn.apply(console, args);
};

// Перехватываем необработанные ошибки
window.addEventListener('error', (e) => {
    addDebugLog(`UNCAUGHT ERROR: ${e.message} at ${e.filename}:${e.lineno}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    addDebugLog(`UNHANDLED PROMISE: ${e.reason}`, 'error');
});

console.log('Debug console initialized');
// === КОНЕЦ КОНСОЛИ ===

// Загрузка данных пользователя из Telegram
function loadUserData() {
    console.log('=== loadUserData START ===');
    
    // СРАЗУ показываем нули чтобы интерфейс не зависал
    document.getElementById('user-tokens').textContent = '0';
    document.getElementById('user-rating').textContent = '0';
    
    console.log('Telegram WebApp available:', !!tg);
    
    if (tg) {
        console.log('initDataUnsafe:', tg.initDataUnsafe);
        console.log('User data available:', !!(tg.initDataUnsafe && tg.initDataUnsafe.user));
    }
    
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('User ID:', user.id);
        console.log('User name:', user.first_name);
        
        // Устанавливаем имя пользователя
        const userName = user.first_name || user.username || 'Пользователь';
        document.getElementById('user-name').textContent = userName;
        
        // Устанавливаем аватар (если есть)
        const avatarContainer = document.getElementById('user-avatar');
        if (user.photo_url) {
            avatarContainer.innerHTML = `<img src="${user.photo_url}" alt="Avatar">`;
        } else {
            // Если нет аватарки - показываем placeholder
            avatarContainer.innerHTML = '<div class="avatar-placeholder">👤</div>';
        }
        
        // Загрузка данных пользователя с сервера В ФОНЕ (не блокирует интерфейс)
        // Всегда передаем актуальную аватарку из Telegram (или null)
        const actualAvatarUrl = user.photo_url || null;
        console.log('Calling loadUserDataFromAPI...');
        loadUserDataFromAPI(user.id, userName, actualAvatarUrl).catch(err => {
            console.error('Failed to load user data:', err);
            // Интерфейс все равно работает с нулями
        });
    } else {
        console.warn('No Telegram user data available!');
        console.warn('This might be because:');
        console.warn('1. Bot is opened outside Telegram');
        console.warn('2. Telegram WebApp not initialized');
        console.warn('3. User data not passed by Telegram');
        
        // Показываем placeholder данные
        document.getElementById('user-name').textContent = 'Гость';
        document.getElementById('user-avatar').innerHTML = '<div class="avatar-placeholder">👤</div>';
        
        // Если есть Telegram но нет данных - пробуем получить хоть что-то
        if (tg) {
            console.log('Telegram object exists, trying to get any data...');
            console.log('Platform:', tg.platform);
            console.log('Version:', tg.version);
            console.log('initData:', tg.initData);
        }
    }
    
    console.log('=== loadUserData END ===');
}

// === API FUNCTIONS ===
// Загрузка данных пользователя с сервера
async function loadUserDataFromAPI(telegramId, name, avatarUrl) {
    console.log('=== loadUserDataFromAPI START ===');
    console.log('Telegram ID:', telegramId);
    console.log('Name:', name);
    console.log('Avatar URL:', avatarUrl);
    
    // Показываем нули сразу, чтобы интерфейс не зависал
    document.getElementById('user-tokens').textContent = '0';
    document.getElementById('user-rating').textContent = '0';
    
    // Проверяем что Supabase загружен
    if (!supabaseClient) {
        console.error('Supabase not initialized!');
        return;
    }
    
    console.log('Supabase is ready');
    
    try {
        console.log(`Loading user data for ${telegramId}...`);
        
        // Таймаут на случай если запрос зависнет
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        console.log('Fetching user from database...');
        
        // Пытаемся получить данные пользователя
        const fetchPromise = supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();
        
        const { data: existingUser, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]);
        
        console.log('Fetch result:', { existingUser, fetchError });
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }
        
        let userData;
        
        if (!existingUser) {
            // Пользователь не найден - создаем нового
            console.log('User not found, creating new user...');
            const { data: newUser, error: createError } = await supabaseClient
                .from('users')
                .insert([{
                    telegram_id: telegramId,
                    name: name,
                    avatar_url: avatarUrl
                }])
                .select()
                .single();
            
            console.log('Create result:', { newUser, createError });
            
            if (createError) throw createError;
            userData = newUser;
        } else {
            // Обновляем данные существующего пользователя
            console.log('User found, updating...');
            const { data: updatedUser, error: updateError } = await supabaseClient
                .from('users')
                .update({
                    name: name,
                    avatar_url: avatarUrl
                })
                .eq('telegram_id', telegramId)
                .select()
                .single();
            
            console.log('Update result:', { updatedUser, updateError });
            
            if (updateError) throw updateError;
            userData = updatedUser;
        }
        
        console.log('User data loaded:', userData);
        
        // Обновляем UI
        document.getElementById('user-tokens').textContent = userData.tokens || '0';
        document.getElementById('user-rating').textContent = userData.rating || '0';
        
        // Сохраняем ID пользователя для дальнейшего использования
        window.currentUserId = telegramId;
        
        // Загружаем кастомизацию
        await loadCustomization(userData);
        
        console.log('=== loadUserDataFromAPI SUCCESS ===');
        
    } catch (error) {
        console.error('=== loadUserDataFromAPI ERROR ===');
        console.error('Error loading user data:', error);
        console.error('Error details:', error.message, error.code, error.details);
        // В случае ошибки показываем нули
        document.getElementById('user-tokens').textContent = '0';
        document.getElementById('user-rating').textContent = '0';
    }
}

// Загрузка таблицы лидеров с сервера
async function loadLeaderboardFromAPI() {
    try {
        console.log('Loading leaderboard...');
        const { data: leaders, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('rating', { ascending: false })
            .order('tokens', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        console.log('Leaderboard loaded:', leaders);
        return leaders;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        return [];
    }
}
// === END API FUNCTIONS ===

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
    
    // Восстанавливаем кастомизацию если возвращаемся с другой страницы
    const savedCustomization = sessionStorage.getItem('userCustomization');
    if (savedCustomization) {
        try {
            const customization = JSON.parse(savedCustomization);
            console.log('Restoring customization from session:', customization);
            
            // Применяем сохраненную кастомизацию
            if (customization.equippedColor) {
                const colorItem = shopItems.colors.find(i => i.id === customization.equippedColor);
                if (colorItem) {
                    setTimeout(() => applyNameColor(colorItem.class), 500);
                }
            }
            
            if (customization.equippedBadge) {
                const badgeItem = shopItems.badges.find(i => i.id === customization.equippedBadge);
                if (badgeItem) {
                    setTimeout(() => applyBadgeColor(badgeItem.class), 500);
                }
            }
        } catch (e) {
            console.error('Error restoring customization:', e);
        }
    }
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
        darkOverlay.style.setProperty('top', overlayTop + 'px', 'important');
        
        // Показываем overlay когда плашка поднимается
        const progress = (newBottom - minBottom) / (maxBottom - minBottom);
        if (progress > 0.05) {
            darkOverlay.style.setProperty('opacity', '1', 'important');
            darkOverlay.style.setProperty('visibility', 'visible', 'important');
        } else {
            darkOverlay.style.setProperty('opacity', '0', 'important');
            darkOverlay.style.setProperty('visibility', 'hidden', 'important');
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
        
        // Возвращаем transition с более плавной easing функцией
        profileCard.style.transition = 'bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        darkOverlay.style.transition = 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.4s';
        
        const deltaY = startY - currentY;
        
        // Финальные позиции
        const finalBottomOpen = maxBottom; // calc(100vh - 120px)
        const finalBottomClosed = minBottom; // 20px
        const finalOverlayTopOpen = screenHeight - maxBottom;
        const finalOverlayTopClosed = screenHeight;
        
        // Если протянули больше чем на 20% экрана - открываем/закрываем полностью
        if (Math.abs(deltaY) > screenHeight * 0.2) {
            if (deltaY > 0) {
                // Протянули вверх - открываем
                profileCard.classList.add('lifted');
                darkOverlay.classList.add('active');
                profileCard.style.bottom = '';
                darkOverlay.style.setProperty('top', finalOverlayTopOpen + 'px', 'important');
                darkOverlay.style.setProperty('opacity', '1', 'important');
                darkOverlay.style.setProperty('visibility', 'visible', 'important');
                profileCard.style.cursor = 'default';
                // Скрываем елочку
                profileCard.querySelector('.swipe-indicator').style.opacity = '0';
            } else {
                // Протянули вниз - закрываем
                profileCard.classList.remove('lifted');
                darkOverlay.classList.remove('active');
                profileCard.style.bottom = '';
                darkOverlay.style.setProperty('top', finalOverlayTopClosed + 'px', 'important');
                darkOverlay.style.setProperty('opacity', '0', 'important');
                darkOverlay.style.setProperty('visibility', 'hidden', 'important');
                profileCard.style.cursor = 'pointer';
                // Показываем елочку
                profileCard.querySelector('.swipe-indicator').style.opacity = '1';
            }
        } else {
            // Иначе возвращаем в исходное состояние
            const isLifted = profileCard.classList.contains('lifted');
            if (isLifted) {
                // Возвращаем наверх
                profileCard.style.bottom = '';
                darkOverlay.style.setProperty('top', finalOverlayTopOpen + 'px', 'important');
                darkOverlay.style.setProperty('opacity', '1', 'important');
                darkOverlay.style.setProperty('visibility', 'visible', 'important');
                // Скрываем елочку
                profileCard.querySelector('.swipe-indicator').style.opacity = '0';
            } else {
                // Возвращаем вниз
                profileCard.style.bottom = '';
                darkOverlay.style.setProperty('top', finalOverlayTopClosed + 'px', 'important');
                darkOverlay.style.setProperty('opacity', '0', 'important');
                darkOverlay.style.setProperty('visibility', 'hidden', 'important');
                // Показываем елочку
                profileCard.querySelector('.swipe-indicator').style.opacity = '1';
            }
        }
        
        haptic();
    });

    // Отменяем touchcancel
    profileCard.addEventListener('touchcancel', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        // Возвращаем transition с более плавной easing функцией
        profileCard.style.transition = 'bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        darkOverlay.style.transition = 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.4s';
        
        // Финальные позиции
        const finalOverlayTopOpen = screenHeight - maxBottom;
        const finalOverlayTopClosed = screenHeight;
        
        // Возвращаем в исходное состояние
        const isLifted = profileCard.classList.contains('lifted');
        if (isLifted) {
            // Возвращаем наверх
            profileCard.style.bottom = '';
            darkOverlay.style.setProperty('top', finalOverlayTopOpen + 'px', 'important');
            darkOverlay.style.setProperty('opacity', '1', 'important');
            darkOverlay.style.setProperty('visibility', 'visible', 'important');
        } else {
            // Возвращаем вниз
            profileCard.style.bottom = '';
            darkOverlay.style.setProperty('top', finalOverlayTopClosed + 'px', 'important');
            darkOverlay.style.setProperty('opacity', '0', 'important');
            darkOverlay.style.setProperty('visibility', 'hidden', 'important');
        }
    });
}

function openOverlay() {
    const profileCard = document.getElementById('user-profile-card');
    const darkOverlay = document.getElementById('dark-overlay');
    
    const screenHeight = window.innerHeight;
    const finalOverlayTop = screenHeight - 120;
    
    // Убираем inline стили у плашки
    profileCard.style.bottom = '';
    
    profileCard.classList.add('lifted');
    darkOverlay.classList.add('active');
    
    darkOverlay.style.setProperty('top', finalOverlayTop + 'px', 'important');
    darkOverlay.style.setProperty('opacity', '1', 'important');
    darkOverlay.style.setProperty('visibility', 'visible', 'important');
    
    profileCard.style.cursor = 'default';
    
    haptic();
}

function closeOverlay() {
    const profileCard = document.getElementById('user-profile-card');
    const darkOverlay = document.getElementById('dark-overlay');
    
    // Убираем inline стили у плашки
    profileCard.style.bottom = '';
    
    darkOverlay.style.setProperty('top', '100vh', 'important');
    darkOverlay.style.setProperty('opacity', '0', 'important');
    darkOverlay.style.setProperty('visibility', 'hidden', 'important');
    
    profileCard.classList.remove('lifted');
    darkOverlay.classList.remove('active');
    
    profileCard.style.cursor = 'pointer';
    
    // Показываем елочки обратно
    const swipeIndicator = profileCard.querySelector('.swipe-indicator');
    if (swipeIndicator) {
        swipeIndicator.style.opacity = '1';
    }
    
    haptic();
}

function openLeaderboard() {
    const overlayContent = document.querySelector('.overlay-content');
    const leaderboardView = document.getElementById('step-leaderboard');
    const profileCard = document.getElementById('user-profile-card');
    const darkOverlay = document.getElementById('dark-overlay');
    
    // 1. Скрываем контент меню плавно
    overlayContent.classList.add('hiding');
    
    // 2. Через 300ms показываем лидерборд и опускаем плашку с overlay
    setTimeout(() => {
        leaderboardView.classList.add('active');
        profileCard.classList.add('in-leaderboard');
        
        // Опускаем overlay вместе с плашкой
        const leaderboardOverlayTop = window.innerHeight - 165;
        darkOverlay.style.setProperty('top', leaderboardOverlayTop + 'px', 'important');
    }, 300);
    
    haptic();
}

function closeLeaderboard() {
    const leaderboardView = document.getElementById('step-leaderboard');
    const overlayContent = document.querySelector('.overlay-content');
    const profileCard = document.getElementById('user-profile-card');
    const darkOverlay = document.getElementById('dark-overlay');
    
    console.log('=== closeLeaderboard START ===');
    
    // Функция для принудительного приклеивания overlay к плашке
    const stickOverlayToCard = () => {
        // ЧИТАЕМ РЕАЛЬНУЮ позицию плашки из DOM
        const cardRect = profileCard.getBoundingClientRect();
        const overlayTop = cardRect.bottom;
        
        console.log('Card position:', {
            top: cardRect.top,
            bottom: cardRect.bottom,
            height: cardRect.height
        });
        console.log('Setting overlay top to:', overlayTop);
        
        darkOverlay.style.setProperty('top', overlayTop + 'px', 'important');
        darkOverlay.style.setProperty('opacity', '1', 'important');
        darkOverlay.style.setProperty('visibility', 'visible', 'important');
    };
    
    // 1. Скрываем лидерборд
    leaderboardView.classList.remove('active');
    
    // 2. Убираем класс у плашки - она начнет двигаться
    profileCard.classList.remove('in-leaderboard');
    
    // 3. Быстрые приклеивания - overlay будет следовать за плашкой
    setTimeout(stickOverlayToCard, 10);
    setTimeout(stickOverlayToCard, 30);
    setTimeout(stickOverlayToCard, 60);
    setTimeout(stickOverlayToCard, 100);
    setTimeout(stickOverlayToCard, 150);
    setTimeout(stickOverlayToCard, 200);
    setTimeout(stickOverlayToCard, 300); // Добавляем попытки после 200ms
    setTimeout(stickOverlayToCard, 400); // Когда анимация точно закончится
    
    // 4. Показываем меню обратно
    setTimeout(() => {
        overlayContent.classList.remove('hiding');
    }, 300);
    
    console.log('=== closeLeaderboard END ===');
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

// Генерация таблицы лидеров с реальными данными с сервера
async function renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    
    // Показываем загрузку
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #8e8e93;">Загрузка...</div>';
    
    // Загружаем данные с сервера
    const leaders = await loadLeaderboardFromAPI();
    
    if (leaders.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #8e8e93;">Нет данных</div>';
        return;
    }
    
    container.innerHTML = leaders.map((leader, index) => {
        const rank = index + 1;
        let medal = '';
        let rankClass = '';
        
        if (rank === 1) {
            medal = '💎';
            rankClass = 'rank-1';
        } else if (rank === 2) {
            medal = '🥇';
            rankClass = 'rank-2';
        } else if (rank === 3) {
            medal = '🥈';
            rankClass = 'rank-3';
        }
        
        // Применяем цвет ника если есть
        let nameClass = '';
        if (leader.name_color) {
            const colorItem = shopItems.colors.find(i => i.id === leader.name_color);
            if (colorItem) {
                nameClass = colorItem.class;
            }
        }
        
        // Применяем бейдж если есть
        let badgeClass = '';
        if (leader.badge_color) {
            const badgeItem = shopItems.badges.find(i => i.id === leader.badge_color);
            if (badgeItem) {
                badgeClass = badgeItem.class;
            }
        }
        
        return `
            <div class="leader-item ${rankClass} ${badgeClass}">
                <div class="leader-rank">${rank}</div>
                ${medal ? `<div class="leader-medal">${medal}</div>` : ''}
                <div class="leader-avatar">
                    ${leader.avatar_url ? 
                        `<img src="${leader.avatar_url}" alt="Avatar">` : 
                        '<div class="leader-avatar-placeholder">👤</div>'
                    }
                </div>
                <div class="leader-info">
                    <div class="leader-name ${nameClass}">${leader.name}</div>
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
    // Сохраняем текущую кастомизацию в sessionStorage перед переходом
    sessionStorage.setItem('userCustomization', JSON.stringify({
        equippedColor: userInventory.equippedColor,
        equippedBadge: userInventory.equippedBadge
    }));
    
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
    renderShop();
    showStep('step-shop');
    haptic();
}

function goToExchange() {
    showStep('step-exchange');
    haptic();
    
    // Обновляем расчет при вводе
    const input = document.getElementById('exchange-amount');
    input.addEventListener('input', () => {
        const amount = parseInt(input.value) || 0;
        const tokens = Math.floor(amount / 100);
        document.getElementById('exchange-tokens').textContent = tokens;
    });
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


// === МАГАЗИН КАСТОМИЗАЦИИ ===
const shopItems = {
    colors: [
        { id: 'blue', name: 'Синий неон', price: 50, class: 'neon-blue' },
        { id: 'red', name: 'Красный неон', price: 50, class: 'neon-red' },
        { id: 'purple', name: 'Фиолетовый неон', price: 75, class: 'neon-purple' },
        { id: 'green', name: 'Зеленый неон', price: 75, class: 'neon-green' }
    ],
    badges: [
        { id: 'blue', name: 'Синее стекло', price: 100, class: 'badge-blue' },
        { id: 'red', name: 'Красное стекло', price: 100, class: 'badge-red' },
        { id: 'purple', name: 'Фиолетовое стекло', price: 150, class: 'badge-purple' },
        { id: 'green', name: 'Зеленое стекло', price: 150, class: 'badge-green' }
    ]
};

let userInventory = {
    colors: [],
    badges: [],
    equippedColor: null,
    equippedBadge: null
};

function switchShopTab(tab) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.shop-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`shop-${tab}`).classList.add('active');
    
    haptic();
}

function renderShop() {
    renderShopColors();
    renderShopBadges();
}

function renderShopColors() {
    const container = document.getElementById('color-items');
    const userName = document.getElementById('user-name').textContent;
    
    container.innerHTML = shopItems.colors.map(item => {
        const owned = userInventory.colors.includes(item.id);
        const equipped = userInventory.equippedColor === item.id;
        
        return `
            <div class="shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}">
                <div class="shop-item-preview ${item.class}">
                    ${userName}
                </div>
                <div class="shop-item-actions">
                    ${owned ? 
                        `<button class="shop-action-btn ${equipped ? 'btn-unequip' : 'btn-equip'}" onclick="toggleEquipItem('colors', '${item.id}')">
                            ${equipped ? '✓ Снять' : 'Надеть'}
                        </button>` :
                        `<button class="shop-action-btn btn-buy" onclick="buyItem('colors', '${item.id}', ${item.price})">
                            Купить ${item.price} 🎟️
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

function renderShopBadges() {
    const container = document.getElementById('badge-items');
    
    container.innerHTML = shopItems.badges.map(item => {
        const owned = userInventory.badges.includes(item.id);
        const equipped = userInventory.equippedBadge === item.id;
        
        return `
            <div class="shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}">
                <div class="shop-item-preview ${item.class}" style="padding: 20px; border-radius: 16px;">
                    Плашка профиля
                </div>
                <div class="shop-item-actions">
                    ${owned ? 
                        `<button class="shop-action-btn ${equipped ? 'btn-unequip' : 'btn-equip'}" onclick="toggleEquipItem('badges', '${item.id}')">
                            ${equipped ? '✓ Снять' : 'Надеть'}
                        </button>` :
                        `<button class="shop-action-btn btn-buy" onclick="buyItem('badges', '${item.id}', ${item.price})">
                            Купить ${item.price} 🎟️
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

async function buyItem(type, itemId, price) {
    const currentTokens = parseInt(document.getElementById('user-tokens').textContent) || 0;
    
    if (currentTokens < price) {
        if (tg?.showAlert) {
            tg.showAlert(`Недостаточно токенов! Нужно ${price} 🎟️`);
        }
        haptic();
        return;
    }
    
    // Подтверждение покупки
    const item = shopItems[type].find(i => i.id === itemId);
    if (tg?.showConfirm) {
        tg.showConfirm(`Купить "${item.name}" за ${price} 🎟️?`, async (confirmed) => {
            if (confirmed) {
                await purchaseItem(type, itemId, price);
            }
        });
    } else {
        await purchaseItem(type, itemId, price);
    }
}

async function toggleEquipItem(type, itemId) {
    const item = shopItems[type].find(i => i.id === itemId);
    const isEquipped = (type === 'colors' ? userInventory.equippedColor : userInventory.equippedBadge) === itemId;
    
    if (isEquipped) {
        // Снять предмет
        if (type === 'colors') {
            userInventory.equippedColor = null;
            // Убираем все классы цветов
            const nameEl = document.getElementById('user-name');
            nameEl.className = '';
        } else {
            userInventory.equippedBadge = null;
            // Убираем все классы бейджей
            const card = document.getElementById('user-profile-card');
            card.classList.remove('badge-blue', 'badge-red', 'badge-purple', 'badge-green');
        }
    } else {
        // Надеть предмет
        if (type === 'colors') {
            userInventory.equippedColor = itemId;
            applyNameColor(item.class);
        } else {
            userInventory.equippedBadge = itemId;
            applyBadgeColor(item.class);
        }
    }
    
    // Сохранить в Supabase
    await saveCustomization();
    
    // Сохраняем в sessionStorage для сохранения при навигации
    sessionStorage.setItem('userCustomization', JSON.stringify({
        equippedColor: userInventory.equippedColor,
        equippedBadge: userInventory.equippedBadge,
        ownedColors: userInventory.colors,
        ownedBadges: userInventory.badges
    }));
    
    // Обновить лидерборд если открыт
    const leaderboardView = document.getElementById('step-leaderboard');
    if (leaderboardView.classList.contains('active')) {
        await renderLeaderboard();
    }
    
    renderShop();
    haptic('success');
}

async function buyOrEquipItem(type, itemId) {
    const item = shopItems[type].find(i => i.id === itemId);
    const owned = userInventory[type].includes(itemId);
    
    if (owned) {
        // Надеть предмет
        if (type === 'colors') {
            userInventory.equippedColor = itemId;
            applyNameColor(item.class);
        } else {
            userInventory.equippedBadge = itemId;
            applyBadgeColor(item.class);
        }
        
        // Сохранить в Supabase
        await saveCustomization();
        
        // Обновить лидерборд если открыт
        const leaderboardView = document.getElementById('step-leaderboard');
        if (leaderboardView.classList.contains('active')) {
            await renderLeaderboard();
        }
        
        renderShop();
        haptic('success');
    } else {
        // Купить предмет
        const currentTokens = parseInt(document.getElementById('user-tokens').textContent) || 0;
        
        if (currentTokens < item.price) {
            if (tg?.showAlert) {
                tg.showAlert(`Недостаточно токенов! Нужно ${item.price} 🎟️`);
            }
            haptic();
            return;
        }
        
        // Подтверждение покупки
        if (tg?.showConfirm) {
            tg.showConfirm(`Купить "${item.name}" за ${item.price} 🎟️?`, async (confirmed) => {
                if (confirmed) {
                    await purchaseItem(type, itemId, item.price, item);
                }
            });
        } else {
            await purchaseItem(type, itemId, item.price, item);
        }
    }
}

async function purchaseItem(type, itemId, price) {
    try {
        console.log('=== PURCHASE START ===');
        console.log('Type:', type, 'ItemId:', itemId, 'Price:', price);
        
        // Списываем токены
        const currentTokens = parseInt(document.getElementById('user-tokens').textContent) || 0;
        const newTokens = currentTokens - price;
        
        // Проверяем что предмет еще не куплен
        if (userInventory[type].includes(itemId)) {
            console.log('Item already owned');
            if (tg?.showAlert) {
                tg.showAlert('Этот предмет уже куплен!');
            }
            return;
        }
        
        // Получаем item для применения стиля
        const item = shopItems[type].find(i => i.id === itemId);
        
        // Добавляем в локальный инвентарь
        userInventory[type].push(itemId);
        
        // Автоматически надеваем купленный предмет
        if (type === 'colors') {
            userInventory.equippedColor = itemId;
        } else {
            userInventory.equippedBadge = itemId;
        }
        
        console.log('Updated inventory:', userInventory);
        console.log('Calling RPC function...');
        
        // Используем PostgreSQL функцию для добавления в массив
        const rpcFunction = type === 'colors' ? 'add_owned_color' : 'add_owned_badge';
        const rpcParam = type === 'colors' ? 'color_id' : 'badge_id';
        
        const { error: rpcError } = await supabaseClient.rpc(rpcFunction, {
            user_id: window.currentUserId,
            [rpcParam]: itemId
        });
        
        if (rpcError) {
            console.error('RPC error:', rpcError);
            throw rpcError;
        }
        
        console.log('RPC success - item added to array');
        
        // Обновляем токены и экипированные предметы
        console.log('Updating tokens and equipped items...');
        const { error: updateError } = await supabaseClient
            .from('users')
            .update({
                tokens: newTokens,
                name_color: userInventory.equippedColor,
                badge_color: userInventory.equippedBadge
            })
            .eq('telegram_id', window.currentUserId);
        
        if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
        }
        
        console.log('Saved successfully');
        
        // Применяем кастомизацию сразу
        if (type === 'colors' && item) {
            applyNameColor(item.class);
        } else if (type === 'badges' && item) {
            applyBadgeColor(item.class);
        }
        
        // Сохраняем в sessionStorage для сохранения при навигации
        sessionStorage.setItem('userCustomization', JSON.stringify({
            equippedColor: userInventory.equippedColor,
            equippedBadge: userInventory.equippedBadge,
            ownedColors: userInventory.colors,
            ownedBadges: userInventory.badges
        }));
        
        // Обновляем UI
        document.getElementById('user-tokens').textContent = newTokens;
        
        // Обновить лидерборд если открыт
        const leaderboardView = document.getElementById('step-leaderboard');
        if (leaderboardView.classList.contains('active')) {
            await renderLeaderboard();
        }
        
        renderShop();
        
        if (tg?.showAlert) {
            tg.showAlert('Покупка успешна! 🎉');
        }
        
        haptic('success');
        showConfetti();
        
        console.log('=== PURCHASE END ===');
        
    } catch (error) {
        console.error('Purchase error:', error);
        console.error('Error message:', error?.message);
        console.error('Error code:', error?.code);
        console.error('Error details:', error?.details);
        console.error('Error hint:', error?.hint);
        console.error('Full error JSON:', JSON.stringify(error, null, 2));
        if (tg?.showAlert) {
            tg.showAlert('Ошибка покупки: ' + (error?.message || 'Unknown error'));
        }
    }
}

function applyNameColor(colorClass) {
    const nameEl = document.getElementById('user-name');
    nameEl.className = colorClass;
}

function applyBadgeColor(badgeClass) {
    const card = document.getElementById('user-profile-card');
    // Удаляем все badge классы
    card.classList.remove('badge-blue', 'badge-red', 'badge-purple', 'badge-green');
    // Добавляем новый
    card.classList.add(badgeClass);
}

async function saveCustomization() {
    if (!window.currentUserId) return;
    
    try {
        const { error } = await supabaseClient
            .from('users')
            .update({
                name_color: userInventory.equippedColor,
                badge_color: userInventory.equippedBadge
            })
            .eq('telegram_id', window.currentUserId);
        
        if (error) throw error;
        console.log('Customization saved');
    } catch (error) {
        console.error('Save customization error:', error);
    }
}

async function loadCustomization(userData) {
    if (!userData) return;
    
    console.log('Loading customization:', userData);
    
    // Функция для нормализации массивов
    const normalizeArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => {
            if (typeof item === 'string' && item.startsWith('{') && item.endsWith('}')) {
                // Убираем фигурные скобки
                return item.slice(1, -1);
            }
            return item;
        }).filter(item => item && item.length > 0);
    };
    
    // Загружаем инвентарь из базы
    if (userData.owned_colors) {
        userInventory.colors = normalizeArray(userData.owned_colors);
        console.log('Loaded colors:', userInventory.colors);
    }
    
    if (userData.owned_badges) {
        userInventory.badges = normalizeArray(userData.owned_badges);
        console.log('Loaded badges:', userInventory.badges);
    }
    
    // Загружаем и применяем кастомизацию из базы
    if (userData.name_color) {
        userInventory.equippedColor = userData.name_color;
        const item = shopItems.colors.find(i => i.id === userData.name_color);
        if (item) {
            console.log('Applying name color:', item.class);
            applyNameColor(item.class);
        }
    }
    
    if (userData.badge_color) {
        userInventory.equippedBadge = userData.badge_color;
        const item = shopItems.badges.find(i => i.id === userData.badge_color);
        if (item) {
            console.log('Applying badge color:', item.class);
            applyBadgeColor(item.class);
        }
    }
    
    console.log('Customization loaded:', userInventory);
}

// === ОБМЕННИК ===
async function performExchange() {
    const amount = parseInt(document.getElementById('exchange-amount').value) || 0;
    
    if (amount < 100) {
        if (tg?.showAlert) {
            tg.showAlert('Минимум 100 рейтинга для обмена!');
        }
        return;
    }
    
    if (amount % 100 !== 0) {
        if (tg?.showAlert) {
            tg.showAlert('Количество должно быть кратно 100!');
        }
        return;
    }
    
    const currentRating = parseInt(document.getElementById('user-rating').textContent) || 0;
    
    if (currentRating < amount) {
        if (tg?.showAlert) {
            tg.showAlert('Недостаточно рейтинга!');
        }
        return;
    }
    
    const tokensToAdd = Math.floor(amount / 100);
    
    if (tg?.showConfirm) {
        tg.showConfirm(`Обменять ${amount} ⭐ на ${tokensToAdd} 🎟️?`, async (confirmed) => {
            if (confirmed) {
                await executeExchange(amount, tokensToAdd);
            }
        });
    } else {
        await executeExchange(amount, tokensToAdd);
    }
}

async function executeExchange(ratingAmount, tokensAmount) {
    try {
        const currentRating = parseInt(document.getElementById('user-rating').textContent) || 0;
        const currentTokens = parseInt(document.getElementById('user-tokens').textContent) || 0;
        
        const newRating = currentRating - ratingAmount;
        const newTokens = currentTokens + tokensAmount;
        
        const { error } = await supabaseClient
            .from('users')
            .update({
                rating: newRating,
                tokens: newTokens
            })
            .eq('telegram_id', window.currentUserId);
        
        if (error) throw error;
        
        // Обновляем UI
        document.getElementById('user-rating').textContent = newRating;
        document.getElementById('user-tokens').textContent = newTokens;
        document.getElementById('exchange-amount').value = '';
        document.getElementById('exchange-tokens').textContent = '0';
        
        if (tg?.showAlert) {
            tg.showAlert(`Успешно! Получено ${tokensAmount} 🎟️`);
        }
        
        haptic('success');
        showConfetti();
        
    } catch (error) {
        console.error('Exchange error:', error);
        if (tg?.showAlert) {
            tg.showAlert('Ошибка обмена. Попробуй позже.');
        }
    }
}
