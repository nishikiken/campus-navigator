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
    entrance2: { x: 58, y: 319 },
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
    n2: { x: 74, y: 318 },
    n3: { x: 204, y: 134 },
    n4: { x: 204, y: 191 },
    n5: { x: 206, y: 317 },
    n6: { x: 206, y: 300 },
    n7: { x: 234, y: 299 },
    n8: { x: 291, y: 299 },
    n9: { x: 291, y: 317 },
    n10: { x: 397, y: 316 },
    n11: { x: 397, y: 298 },
    n12: { x: 363, y: 297 },
    n13: { x: 205, y: 234 },
    n14: { x: 398, y: 233 },
    n15: { x: 292, y: 233 },
    n16: { x: 206, y: 248 },
    n17: { x: 204, y: 164 },
    n18: { x: 398, y: 142 },
    n19: { x: 420, y: 140 },
    n20: { x: 539, y: 92 },
    n21: { x: 538, y: 313 },
    n22: { x: 486, y: 315 },
    n23: { x: 486, y: 367 },
    n24: { x: 486, y: 408 },
    n25: { x: 396, y: 386 },
    n26: { x: 395, y: 447 },
    n27: { x: 639, y: 313 },
    n29: { x: 746, y: 179 },
    n30: { x: 709, y: 178 },
    n31: { x: 707, y: 248 },
    n32: { x: 674, y: 313 },
    n33: { x: 538, y: 237 },
    n34: { x: 556, y: 237 },
    n35: { x: 397, y: 190 },
    n36: { x: 610, y: 363 },
    be2: { x: 187, y: 163 },
    be3: { x: 186, y: 247 },
    be4: { x: 293, y: 217 },
    be5: { x: 443, y: 140 },
    be6: { x: 538, y: 79 },
    be7: { x: 556, y: 221 },
    be8: { x: 640, y: 330 },
    be9: { x: 498, y: 367 },
    be10: { x: 496, y: 407 },
    be11: { x: 425, y: 386 },
    be12: { x: 413, y: 458 },
    be13: { x: 697, y: 177 },
    be14: { x: 609, y: 395 }
};

// Граф путей (какие точки соединены дорогами)
const pathGraph = {
    1: ['be5'],
    2: ['be3'],
    3: ['be9'],
    4: ['be12'],
    5: ['be13'],
    6: ['be2'],
    7: ['be2'],
    8: ['be4'],
    9: ['be8'],
    10: ['be7'],
    11: ['be10'],
    12: ['be6'],
    19: ['be14'],
    entrance1: ['n1'],
    entrance2: ['n2'],
    entrance3: ['n29'],
    n1: ['n3', 'entrance1', 'n2'],
    n2: ['entrance2', 'n5', 'n1'],
    n3: ['n1', 'n17'],
    n4: ['n13', 'n17', 'n35'],
    n5: ['n2', 'n6', 'n9'],
    n6: ['n5', 'n16', 'n7'],
    n7: ['n6', 'n8', 'n15'],
    n8: ['n7', 'n12', 'n15', 'n9'],
    n9: ['n5', 'n8', 'n10'],
    n10: ['n9', 'n11', 'n25', 'n22'],
    n11: ['n12', 'n10', 'n14'],
    n12: ['n8', 'n11', 'n15'],
    n13: ['n4', 'n16', 'n15'],
    n14: ['n15', 'n11', 'n35'],
    n15: ['n12', 'n8', 'n7', 'n13', 'n14', 'be4'],
    n16: ['be3', 'n13', 'n6'],
    n17: ['be2', 'n4', 'n3'],
    n18: ['n35', 'n19'],
    n19: ['n18', 'be5'],
    n20: ['n33', 'be6'],
    n21: ['n22', 'n33', 'n27'],
    n22: ['n10', 'n23', 'n21'],
    n23: ['n22', 'be9', 'n24'],
    n24: ['n23', 'be10'],
    n25: ['n10', 'be11', 'n26'],
    n26: ['n25', 'be12'],
    n27: ['n21', 'be8', 'n32'],
    n29: ['entrance3', 'n31', 'n30'],
    n30: ['n29', 'be13'],
    n31: ['n32', 'n29'],
    n32: ['n27', 'n31'],
    n33: ['n21', 'n34', 'n20'],
    n34: ['n33', 'be7'],
    n35: ['n4', 'n14', 'n18'],
    n36: ['be8', 'be14'],
    be2: ['n17', '6', '7'],
    be3: ['n16', '2'],
    be4: ['n15', '8'],
    be5: ['n19', '1'],
    be6: ['n20', '12'],
    be7: ['n34', '10'],
    be8: ['n27', 'n36', '9'],
    be9: ['n23', '3'],
    be10: ['n24', '11'],
    be11: ['n25'],
    be12: ['n26', '4'],
    be13: ['n30', '5'],
    be14: ['n36', '19']
};

// Алгоритм поиска кратчайшего пути (BFS)
function findPath(start, end) {
    const queue = [[start]];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        
        if (node === end) {
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
    
    return null;
}

// Выбор корпуса
function selectBuilding(buildingId) {
    console.log('selectBuilding called with:', buildingId);
    
    // Снять выделение с предыдущего
    document.querySelectorAll('.building-marker').forEach(b => b.classList.remove('selected'));
    
    // Выделить текущий
    const building = document.querySelector(`.building-marker[data-building="${buildingId}"]`);
    if (building) {
        building.classList.add('selected');
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
    const path = findPath(from, to);
    
    if (!path) {
        alert('Маршрут не найден');
        return;
    }
    
    // Очистить предыдущий маршрут
    const routeLayer = document.getElementById('route-layer');
    routeLayer.innerHTML = '';
    
    // Построить линию маршрута
    const points = path.map(nodeId => {
        const coord = coordinates[nodeId];
        return `${coord.x},${coord.y}`;
    }).join(' ');
    
    // Создать путь
    const routePath = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    routePath.setAttribute('points', points);
    routePath.setAttribute('class', 'route-path');
    routeLayer.appendChild(routePath);
    
    // Добавить точки на маршруте
    path.forEach((nodeId, index) => {
        const coord = coordinates[nodeId];
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
    
    const startMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startMarker.setAttribute('cx', startCoord.x);
    startMarker.setAttribute('cy', startCoord.y);
    startMarker.setAttribute('r', 8);
    startMarker.setAttribute('fill', '#00FF00');
    startMarker.setAttribute('class', 'route-marker');
    routeLayer.appendChild(startMarker);
    
    const endMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    endMarker.setAttribute('cx', endCoord.x);
    endMarker.setAttribute('cy', endCoord.y);
    endMarker.setAttribute('r', 8);
    endMarker.setAttribute('fill', '#FF0000');
    endMarker.setAttribute('class', 'route-marker');
    routeLayer.appendChild(endMarker);
    
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
