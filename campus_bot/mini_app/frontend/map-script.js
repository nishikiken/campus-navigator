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

// Координаты для построения маршрутов (центры корпусов и входов)
const coordinates = {
    // Входы (3 входа)
    entrance1: { x: 45, y: 245 },  // Западный (главный)
    entrance2: { x: 410, y: 290 }, // Центральный
    entrance3: { x: 410, y: 385 }, // Южный
    
    // Корпуса (точные координаты от редактора)
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
    
    // Узлы для построения путей (невидимые точки пересечений)
    n1: { x: 90, y: 245 },   // От западного входа
    n2: { x: 230, y: 195 },  // Возле корпуса 8
    n3: { x: 315, y: 195 },  // Центральная точка
    n4: { x: 390, y: 195 },  // Перед корпусом 1
    n5: { x: 390, y: 290 },  // Центральный вход
    n6: { x: 390, y: 385 },  // Южный вход
    n7: { x: 530, y: 290 },  // Центр между корпусами
    n8: { x: 530, y: 385 },  // Возле корпуса 3
    n9: { x: 670, y: 290 },  // Правая сторона
    n10: { x: 765, y: 195 }  // Возле корпуса 5
};

// pathNodes больше не нужен - все координаты в coordinates

// Граф путей (какие узлы соединены) - упрощенный для 3 входов
const pathGraph = {
    // Входы
    entrance1: ['n1'],
    entrance2: ['n5'],
    entrance3: ['n6'],
    
    // Узлы
    n1: ['entrance1', 'n2', '6', '7'],
    n2: ['n1', 'n3', '8'],
    n3: ['n2', 'n4'],
    n4: ['n3', 'n5', '1', '10', '12'],
    n5: ['entrance2', 'n4', 'n6', 'n7'],
    n6: ['entrance3', 'n5', 'n8', '2', '4'],
    n7: ['n5', 'n8', 'n9', '10'],
    n8: ['n6', 'n7', '3', '11'],
    n9: ['n7', 'n10', '9', '19'],
    n10: ['n4', 'n9', '5'],
    
    // Корпуса к ближайшим узлам
    1: ['n4'],
    2: ['n6'],
    3: ['n8'],
    4: ['n6'],
    5: ['n10'],
    6: ['n1'],
    7: ['n1'],
    8: ['n2'],
    9: ['n9'],
    10: ['n4', 'n7'],
    11: ['n8'],
    12: ['n4'],
    19: ['n9']
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
