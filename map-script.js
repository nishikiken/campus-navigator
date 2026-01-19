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
    19: { name: "Корпус 19", description: "Учебный корпус" },
    obsh2: { name: "Общежитие №2", description: "Студенческое общежитие" },
    obsh8: { name: "Общежитие №8", description: "Студенческое общежитие" },
    eni: { name: "ЕНИ", description: "Естественнонаучный институт" }
};

// Координаты для построения маршрутов (центры корпусов и входов)
const coordinates = {
    // Входы
    west1: { x: 50, y: 150 },
    west2: { x: 50, y: 260 },
    west3: { x: 50, y: 350 },
    center: { x: 395, y: 310 },
    south: { x: 395, y: 400 },
    east: { x: 725, y: 150 },
    
    // Корпуса
    1: { x: 440, y: 185 },
    2: { x: 430, y: 385 },
    3: { x: 510, y: 395 },
    4: { x: 430, y: 485 },
    5: { x: 750, y: 175 },
    6: { x: 130, y: 245 },
    7: { x: 130, y: 165 },
    8: { x: 210, y: 205 },
    9: { x: 650, y: 355 },
    10: { x: 555, y: 220 },
    11: { x: 630, y: 425 },
    12: { x: 515, y: 75 },
    19: { x: 730, y: 405 },
    obsh2: { x: 305, y: 140 },
    obsh8: { x: 555, y: 390 },
    eni: { x: 430, y: 290 }
};

// Узлы для построения путей (ключевые точки пересечений)
const pathNodes = {
    n1: { x: 80, y: 150 },
    n2: { x: 80, y: 260 },
    n3: { x: 80, y: 350 },
    n4: { x: 215, y: 200 },
    n5: { x: 305, y: 200 },
    n6: { x: 375, y: 200 },
    n7: { x: 375, y: 310 },
    n8: { x: 375, y: 400 },
    n9: { x: 510, y: 310 },
    n10: { x: 510, y: 400 },
    n11: { x: 650, y: 310 },
    n12: { x: 750, y: 200 }
};

// Граф путей (какие узлы соединены)
const pathGraph = {
    west1: ['n1'],
    west2: ['n2'],
    west3: ['n3'],
    n1: ['west1', 'n2', 'n4', '7'],
    n2: ['west2', 'n1', 'n3', 'n4', '6'],
    n3: ['west3', 'n2', 'n8'],
    n4: ['n1', 'n2', 'n5', '8'],
    n5: ['n4', 'n6', 'obsh2'],
    n6: ['n5', 'n7', '1', '10'],
    n7: ['n6', 'center', 'n8', 'n9', 'eni'],
    center: ['n7'],
    n8: ['n3', 'n7', 'south', 'n10', '2'],
    south: ['n8'],
    n9: ['n7', 'n10', 'n11', '10', '12'],
    n10: ['n8', 'n9', '3', 'obsh8'],
    n11: ['n9', 'n12', '9', '11', '19'],
    n12: ['n11', 'east', '5'],
    east: ['n12'],
    
    // Корпуса к ближайшим узлам
    1: ['n6'],
    2: ['n8'],
    3: ['n10'],
    4: ['n8'],
    5: ['n12'],
    6: ['n2'],
    7: ['n1'],
    8: ['n4'],
    9: ['n11'],
    10: ['n6', 'n9'],
    11: ['n11'],
    12: ['n9'],
    19: ['n11'],
    obsh2: ['n5'],
    obsh8: ['n10'],
    eni: ['n7']
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
    // Снять выделение с предыдущего
    document.querySelectorAll('.building').forEach(b => b.classList.remove('selected'));
    
    // Выделить текущий
    const building = document.querySelector(`[data-building="${buildingId}"]`);
    if (building) {
        building.classList.add('selected');
        selectedBuilding = buildingId;
        
        // Показать информацию
        const data = buildingData[buildingId];
        document.getElementById('building-name').textContent = data.name;
        document.getElementById('building-description').textContent = data.description;
        document.getElementById('building-info').classList.remove('hidden');
        
        haptic();
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
    const building = document.querySelector(`[data-building="${to}"]`);
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
    document.querySelectorAll('.building').forEach(b => {
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
    haptic();
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.2, 0.5);
    applyZoom();
    haptic();
}

function resetView() {
    currentZoom = 1;
    applyZoom();
    haptic();
}

function applyZoom() {
    const map = document.getElementById('campus-map');
    map.style.transform = `scale(${currentZoom})`;
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
});
