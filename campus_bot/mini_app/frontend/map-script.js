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

// Данные о корпусах
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
    19: { name: "Корпус 19", description: "Учебный корпус" }
};

// Координаты для построения маршрутов
const coordinates = {
    entrance1: { x: 60, y: 135 },
    entrance2: { x: 56, y: 319 },
    entrance3: { x: 774, y: 177 },
    1: { x: 450, y: 175 },
    2: { x: 444, y: 376 },
    3: { x: 510, y: 387 },
    4: { x: 421, y: 478 },
    5: { x: 678, y: 174 },
    6: { x: 149, y: 241 },
    7: { x: 149, y: 157 },
    8: { x: 293, y: 198 },
    9: { x: 640, y: 351 },
    10: { x: 576, y: 207 },
    11: { x: 609, y: 418 },
    12: { x: 510, y: 67 },
    19: { x: 709, y: 406 },
    n1: { x: 76, y: 135 },
    n2: { x: 204, y: 133 },
    n3: { x: 204, y: 191 },
    n4: { x: 74, y: 318 },
    n5: { x: 207, y: 316 },
    n6: { x: 292, y: 318 },
    n7: { x: 396, y: 316 },
    n8: { x: 397, y: 190 },
    n9: { x: 204, y: 234 },
    n10: { x: 205, y: 247 },
    n11: { x: 291, y: 233 },
    n12: { x: 397, y: 233 },
    n13: { x: 398, y: 128 },
    n14: { x: 398, y: 141 },
    n15: { x: 233, y: 299 },
    n16: { x: 206, y: 299 },
    n17: { x: 291, y: 298 },
    n18: { x: 363, y: 298 },
    n19: { x: 396, y: 298 },
    n20: { x: 396, y: 383 },
    n21: { x: 395, y: 447 },
    n22: { x: 486, y: 314 },
    n23: { x: 486, y: 367 },
    n24: { x: 485, y: 407 },
    n25: { x: 539, y: 314 },
    n26: { x: 538, y: 238 },
    n27: { x: 539, y: 108 },
    n28: { x: 641, y: 313 },
    n29: { x: 609, y: 354 },
    n30: { x: 746, y: 179 },
    n31: { x: 711, y: 178 },
    n32: { x: 709, y: 245 },
    n33: { x: 678, y: 312 },
    n34: { x: 204, y: 163 },
    be7: { x: 184, y: 163 },
    be6: { x: 184, y: 248 },
    be8: { x: 292, y: 218 },
    be1: { x: 443, y: 140 },
    be12: { x: 539, y: 82 },
    be10: { x: 556, y: 225 },
    be2: { x: 426, y: 385 },
    be4: { x: 414, y: 457 },
    be3: { x: 498, y: 367 },
    be9: { x: 640, y: 331 },
    be11: { x: 609, y: 396 },
    be5: { x: 696, y: 176 },
    med1: { x: 360, y: 127 }
};

// Граф путей (какие точки соединены дорогами)
const pathGraph = {
    1: ['be1'],
    2: ['be2'],
    3: ['be3'],
    4: ['be4'],
    5: ['be5'],
    6: ['be6'],
    7: ['be7'],
    8: ['be8'],
    9: ['be9'],
    10: ['be10'],
    11: ['be11'],
    12: ['be12'],
    19: [],
    entrance1: ['n1'],
    entrance2: ['n4'],
    entrance3: ['n30'],
    n1: ['entrance1', 'n2', 'n4'],
    n2: ['n1', 'n34'],
    n3: ['n34', 'n9', 'n8'],
    n4: ['n5', 'n1', 'entrance2'],
    n5: ['n16', 'n4', 'n6'],
    n6: ['n5', 'n17', 'n7'],
    n7: ['n19', 'n6', 'n20', 'n22'],
    n8: ['n12', 'n3', 'n14'],
    n9: ['n3', 'n10', 'n11'],
    n10: ['n9', 'be6', 'n16'],
    n11: ['n9', 'n15', 'n18', 'n17', 'n12'],
    n12: ['n11', 'n19', 'n8'],
    n13: ['n14', 'med1'],
    n14: ['n8', 'be1', 'n13'],
    n15: ['n11', 'n16', 'n17'],
    n16: ['n15', 'n10', 'n5'],
    n17: ['n6', 'n15', 'n18', 'n11'],
    n18: ['n17', 'n11', 'n19'],
    n19: ['n12', 'n18', 'n7'],
    n20: ['n7', 'be2', 'n21'],
    n21: ['n20', 'be4'],
    n22: ['n7', 'n23', 'n25'],
    n23: ['n22', 'be3', 'n24'],
    n24: ['n23'],
    n25: ['n22', 'n28', 'n26'],
    n26: ['n25', 'be10', 'n27'],
    n27: ['n26', 'be12'],
    n28: ['n25', 'be9', 'n33'],
    n29: ['be9', 'be11'],
    n30: ['entrance3', 'n32', 'n31'],
    n31: ['n30', 'be5'],
    n32: ['n33', 'n30'],
    n33: ['n28', 'n32'],
    n34: ['n2', 'be7', 'n3'],
    be7: ['n34', '7'],
    be6: ['n10', '6'],
    be8: ['8'],
    be1: ['n14', '1'],
    be12: ['n27', '12'],
    be10: ['n26', '10'],
    be2: ['n20', '2'],
    be4: ['n21', '4'],
    be3: ['n23', '3'],
    be9: ['n28', 'n29', '9'],
    be11: ['n29', '11'],
    be5: ['n31', '5'],
    med1: ['n13']
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
    
    // Построить маршрут
    buildRoute(entranceId, selectedBuilding);
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
        dot.setAttribute('r', 5);
        dot.setAttribute('class', 'route-dot');
        dot.style.animationDelay = `${index * 0.2}s`;
        routeLayer.appendChild(dot);
    });
    
    // Добавить маркеры начала и конца
    const startCoord = coordinates[from];
    const endCoord = coordinates[to];
    
    if (startCoord) {
        const startMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startMarker.setAttribute('cx', startCoord.x);
        startMarker.setAttribute('cy', startCoord.y);
        startMarker.setAttribute('r', 8);
        startMarker.setAttribute('fill', '#00FF00');
        startMarker.setAttribute('class', 'route-marker');
        routeLayer.appendChild(startMarker);
    }
    
    if (endCoord) {
        const endMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        endMarker.setAttribute('cx', endCoord.x);
        endMarker.setAttribute('cy', endCoord.y);
        endMarker.setAttribute('r', 8);
        endMarker.setAttribute('fill', '#FF0000');
        endMarker.setAttribute('class', 'route-marker');
        routeLayer.appendChild(endMarker);
    }
    
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
