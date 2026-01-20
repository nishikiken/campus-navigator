// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Состояние
let selectedBuilding = null;
let selectedEntrance = null;
let currentZoom = 1;

// Данные о корпусах и медпунктах
const buildingData = {
    1: { name: "Корпус 1", description: "Главный учебный корпус" },
    2: { name: "Корпус 2", description: "Учебный корпус" },
    3: { name: "Корпус 3", description: "Учебный корпус" },
    4: { name: "Корпус 4", description: "Учебный корпус" },
    5: { name: "Корпус 5", description: "Учебный корпус" },
    6: { name: "Корпус 6", description: "Учебный корпус" },
    7: { name: "Корпус 7", description: "Учебный корпус" },
    8: { name: "Корпус 8", description: "Учебный корпус" },
    9: { name: "Корпус 9", description: "Учебный корпус" },
    10: { name: "Корпус 10", description: "Учебный корпус" },
    11: { name: "Корпус 11", description: "Учебный корпус" },
    12: { name: "Корпус 12", description: "Учебный корпус" },
    19: { name: "Корпус 19", description: "Учебный корпус" },
    med1: { name: "Медпункт", description: "Медицинский пункт" }
};

// Координаты для построения маршрутов
const coordinates = {
    entrance1: { x: 60, y: 135 },
    entrance2: { x: 59, y: 318 },
    entrance3: { x: 763, y: 177 },
    1: { x: 450, y: 175 },
    2: { x: 444, y: 376 },
    3: { x: 509, y: 388 },
    4: { x: 421, y: 478 },
    5: { x: 678, y: 175 },
    6: { x: 149, y: 242 },
    7: { x: 149, y: 159 },
    8: { x: 293, y: 200 },
    9: { x: 640, y: 352 },
    10: { x: 577, y: 208 },
    11: { x: 609, y: 419 },
    12: { x: 510, y: 68 },
    19: { x: 709, y: 407 },
    n6: { x: 75, y: 135 },
    n7: { x: 204, y: 135 },
    n8: { x: 204, y: 163 },
    n9: { x: 204, y: 191 },
    n10: { x: 398, y: 190 },
    n11: { x: 204, y: 235 },
    n12: { x: 292, y: 234 },
    n13: { x: 398, y: 233 },
    n14: { x: 205, y: 248 },
    n15: { x: 205, y: 300 },
    n16: { x: 206, y: 317 },
    n18: { x: 78, y: 318 },
    n20: { x: 232, y: 300 },
    n21: { x: 291, y: 299 },
    n22: { x: 364, y: 298 },
    n23: { x: 397, y: 298 },
    n24: { x: 291, y: 316 },
    n25: { x: 397, y: 315 },
    n26: { x: 397, y: 383 },
    n27: { x: 397, y: 451 },
    n28: { x: 414, y: 451 },
    n29: { x: 486, y: 314 },
    n30: { x: 486, y: 368 },
    n31: { x: 537, y: 314 },
    n32: { x: 537, y: 236 },
    n33: { x: 556, y: 236 },
    n34: { x: 539, y: 96 },
    n35: { x: 640, y: 313 },
    n36: { x: 609, y: 337 },
    n37: { x: 609, y: 369 },
    n39: { x: 707, y: 178 },
    n40: { x: 705, y: 250 },
    n41: { x: 748, y: 178 },
    n42: { x: 677, y: 313 },
    n48: { x: 398, y: 141 },
    n49: { x: 398, y: 126 },
    be12: { x: 539, y: 76 },
    be1: { x: 449, y: 140 },
    be10: { x: 556, y: 220 },
    be5: { x: 689, y: 178 },
    be9: { x: 640, y: 336 },
    be11: { x: 609, y: 400 },
    be3: { x: 504, y: 367 },
    be2: { x: 436, y: 383 },
    be4: { x: 414, y: 463 },
    be8: { x: 292, y: 213 },
    be6: { x: 181, y: 248 },
    be7: { x: 180, y: 163 },
    med1: { x: 363, y: 127 }
};

// Граф путей (какие точки соединены дорогами)
const pathGraph = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
    12: [],
    19: [],
    entrance1: ['n6'],
    entrance2: ['n18'],
    entrance3: ['n41'],
    n6: ['n7', 'entrance1'],
    n7: ['n6', 'n8'],
    n8: ['n7', 'be7', 'n9'],
    n9: ['n8', 'n11', 'n10'],
    n10: ['n13', 'n9', 'n48'],
    n11: ['n14', 'n9', 'n12'],
    n12: ['n11', 'be8', 'n13', 'n20', 'n22', 'n21'],
    n13: ['n12', 'n23', 'n10'],
    n14: ['n15', 'be6', 'n11'],
    n15: ['n16', 'n14', 'n20'],
    n16: ['n18', 'n15', 'n24'],
    n18: ['entrance2', 'n16'],
    n20: ['n12', 'n15', 'n21'],
    n21: ['n20', 'n22', 'n12', 'n24'],
    n22: ['n21', 'n23', 'n12'],
    n23: ['n22', 'n13', 'n25'],
    n24: ['n21', 'n16', 'n25'],
    n25: ['n24', 'n23', 'n26', 'n29'],
    n26: ['n25', 'n27', 'be2'],
    n27: ['n26', 'n28'],
    n28: ['n27', 'be4'],
    n29: ['n25', 'n30', 'n31'],
    n30: ['n29', 'be3'],
    n31: ['n29', 'n32', 'n35'],
    n32: ['n31', 'n33', 'n34'],
    n33: ['n32', 'be10'],
    n34: ['n32', 'be12'],
    n35: ['n31', 'be9', 'n42'],
    n36: ['be9', 'n37'],
    n37: ['n36', 'be11'],
    n39: ['n41', 'be5', 'n40'],
    n40: ['n42', 'n41', 'n39'],
    n41: ['n40', 'n39', 'entrance3'],
    n42: ['n35', 'n40'],
    n48: ['n10', 'be1', 'n49'],
    n49: ['n48', 'med1'],
    be12: ['n34'],
    be1: ['n48'],
    be10: ['n33'],
    be5: ['n39'],
    be9: ['n35', 'n36'],
    be11: ['n37'],
    be3: ['n30'],
    be2: ['n26'],
    be4: ['n28'],
    be8: ['n12'],
    be6: ['n14'],
    be7: ['n8'],
    med1: ['n49']
};

// Алгоритм поиска кратчайшего пути (BFS)
function findPath(start, end) {
    console.log('Finding path from', start, 'to', end);
    console.log('Start neighbors:', pathGraph[start]);
    console.log('End neighbors:', pathGraph[end]);
    
    const queue = [[start]];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        
        if (node === end) {
            console.log('Path found:', path);
            return path;
        }
        
        const neighbors = pathGraph[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }
    
    console.error('No path found from', start, 'to', end);
    return null;
}

// Выбор корпуса
function selectBuilding(buildingId) {
    console.log('selectBuilding called with:', buildingId);
    
    // Снять выделение с предыдущего
    document.querySelectorAll('.building-marker').forEach(b => {
        b.classList.remove('selected');
        b.classList.remove('clicked');
    });
    
    // Выделить текущий и добавить анимацию волны
    const building = document.querySelector(`.building-marker[data-building="${buildingId}"]`);
    if (building) {
        building.classList.add('selected');
        building.classList.add('clicked');
        
        // Убрать класс clicked через 600ms (длительность анимации)
        setTimeout(() => {
            building.classList.remove('clicked');
        }, 600);
        
        selectedBuilding = buildingId;
        
        // Показать информацию
        const data = buildingData[buildingId];
        if (data) {
            document.getElementById('building-name').textContent = data.name;
            document.getElementById('building-description').textContent = data.description;
            document.getElementById('building-info').classList.remove('hidden');
            console.log('Building info shown for:', buildingId);
        } else {
            console.error('Building data not found for:', buildingId);
        }
        
        haptic();
    } else {
        console.error('Building element not found for:', buildingId);
    }
}

// Показать панель выбора входа
function showEntrancePanel() {
    if (!selectedBuilding) return;
    document.getElementById('building-info').classList.add('hidden');
    document.getElementById('entrance-panel').classList.remove('hidden');
    haptic();
}

// Выбор входа и построение маршрута
function selectEntrance(entranceId) {
    selectedEntrance = entranceId;
    document.getElementById('entrance-panel').classList.add('hidden');
    
    // Найти вход в корпус (be) для выбранного корпуса
    const buildingEntranceId = 'be' + selectedBuilding;
    
    // Построить маршрут от входа на кампус до входа в корпус
    buildRoute(entranceId, buildingEntranceId);
    haptic('success');
}

// Построение маршрута
function buildRoute(from, to) {
    console.log('buildRoute called:', from, '→', to);
    const path = findPath(from, to);
    
    console.log('Found path:', path);
    
    if (!path) {
        alert('Маршрут не найден. Проверьте, что все дороги соединены.');
        console.error('Path not found from', from, 'to', to);
        return;
    }
    
    // Очистить предыдущий маршрут
    const routeLayer = document.getElementById('route-layer');
    routeLayer.innerHTML = '';
    
    // Построить линию маршрута
    const points = path.map(nodeId => {
        const coord = coordinates[nodeId];
        if (!coord) {
            console.error('Coordinate not found for node:', nodeId);
            return null;
        }
        return `${coord.x},${coord.y}`;
    }).filter(p => p !== null).join(' ');
    
    console.log('Route points:', points);
    
    // Создать путь
    const routePath = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    routePath.setAttribute('points', points);
    routePath.setAttribute('class', 'route-path');
    routeLayer.appendChild(routePath);
    
    // Добавить точки на маршруте
    path.forEach((nodeId, index) => {
        const coord = coordinates[nodeId];
        if (!coord) return;
        
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', coord.x);
        dot.setAttribute('cy', coord.y);
        dot.setAttribute('r', 3);
        dot.setAttribute('class', 'route-dot');
        dot.style.animationDelay = `${index * 0.2}s`;
        routeLayer.appendChild(dot);
    });
    
    // Подсветить корпус
    const building = document.querySelector(`.building-marker[data-building="${to}"]`);
    if (building) {
        building.classList.add('highlighted');
    }
}

// Отмена выбора
function cancelSelection() {
    document.getElementById('entrance-panel').classList.add('hidden');
    haptic();
}

// Закрыть информацию
function closeInfo() {
    document.getElementById('building-info').classList.add('hidden');
    document.querySelectorAll('.building-marker').forEach(b => {
        b.classList.remove('selected');
        b.classList.remove('highlighted');
    });
    
    // Очистить маршрут
    document.getElementById('route-layer').innerHTML = '';
    
    selectedBuilding = null;
    selectedEntrance = null;
    haptic();
}

// Управление зумом
function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.2, 3);
    applyZoom();
    console.log('Zoom in:', currentZoom);
    haptic();
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.2, 0.5);
    applyZoom();
    console.log('Zoom out:', currentZoom);
    haptic();
}

function resetView() {
    currentZoom = 1;
    applyZoom();
    console.log('Reset zoom:', currentZoom);
    haptic();
}

function applyZoom() {
    const map = document.getElementById('campus-map');
    if (map) {
        map.style.transform = `scale(${currentZoom})`;
        console.log('Applied zoom:', currentZoom);
    } else {
        console.error('Map element not found');
    }
}

// Возврат назад
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Тактильная обратная связь
function haptic(type = 'selection') {
    if (tg?.HapticFeedback) {
        if (type === 'success') {
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            tg.HapticFeedback.selectionChanged();
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Интерактивная карта загружена');
    
    // Добавить обработчики кликов на все маркеры
    document.querySelectorAll('.building-marker').forEach(marker => {
        const buildingId = marker.getAttribute('data-building');
        marker.addEventListener('click', () => {
            console.log('Clicked building:', buildingId);
            selectBuilding(buildingId);
        });
        marker.style.cursor = 'pointer';
    });
});
