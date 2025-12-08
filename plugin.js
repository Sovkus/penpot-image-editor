// Image Editor Plugin for Penpot
console.log("Image Editor Plugin loading...");

// Основные переменные
let selectedImage = null;
let currentFilters = {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0
};

// Получаем элементы DOM
const previewImage = document.getElementById('previewImage');
const noImageMessage = document.getElementById('noImage');
const previewContainer = document.getElementById('previewContainer');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const errorMessage = document.getElementById('errorMessage');

// Инициализация ползунков
const sliders = {
    exposure: document.getElementById('exposure'),
    contrast: document.getElementById('contrast'),
    saturation: document.getElementById('saturation'),
    temperature: document.getElementById('temperature'),
    tint: document.getElementById('tint'),
    highlights: document.getElementById('highlights'),
    shadows: document.getElementById('shadows')
};

const valueDisplays = {
    exposure: document.getElementById('exposureValue'),
    contrast: document.getElementById('contrastValue'),
    saturation: document.getElementById('saturationValue'),
    temperature: document.getElementById('temperatureValue'),
    tint: document.getElementById('tintValue'),
    highlights: document.getElementById('highlightsValue'),
    shadows: document.getElementById('shadowsValue')
};

// Функция инициализации плагина
function initializePlugin() {
    console.log("Initializing plugin controls...");
    
    try {
        // Настройка обработчиков для ползунков
        Object.keys(sliders).forEach(key => {
            const slider = sliders[key];
            const valueDisplay = valueDisplays[key];
            
            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    currentFilters[key] = value;
                    valueDisplay.textContent = value;
                    updateImagePreview();
                });
            }
        });
        
        // Кнопка сброса
        if (resetBtn) {
            resetBtn.addEventListener('click', resetAllFilters);
        }
        
        // Кнопка применения
        if (applyBtn) {
            applyBtn.addEventListener('click', applyFiltersToImage);
        }
        
        console.log("Plugin controls initialized");
        
    } catch (error) {
        console.error("Error initializing controls:", error);
    }
}

// Функция обновления предпросмотра
function updateImagePreview() {
    if (!previewImage || !previewImage.src) return;
    
    const filterString = generateFilterString();
    previewImage.style.filter = filterString;
}

// Генерация строки CSS фильтра
function generateFilterString() {
    const f = currentFilters;
    const filters = [];
    
    if (f.exposure !== 0) filters.push(`brightness(${1 + f.exposure / 100})`);
    if (f.contrast !== 0) filters.push(`contrast(${1 + f.contrast / 100})`);
    if (f.saturation !== 0) filters.push(`saturate(${1 + f.saturation / 100})`);
    
    if (f.temperature !== 0) {
        const temp = f.temperature / 100;
        if (temp > 0) {
            filters.push(`sepia(${temp})`);
        } else {
            filters.push(`hue-rotate(${temp * 180}deg)`);
        }
    }
    
    if (f.tint !== 0) filters.push(`hue-rotate(${f.tint * 1.8}deg)`);
    
    if (f.highlights !== 0 || f.shadows !== 0) {
        const brightness = 1 + (f.highlights - f.shadows) / 200;
        filters.push(`brightness(${brightness})`);
    }
    
    return filters.join(' ') || 'none';
}

// Сброс всех фильтров
function resetAllFilters() {
    Object.keys(currentFilters).forEach(key => {
        currentFilters[key] = 0;
        
        const slider = sliders[key];
        const valueDisplay = valueDisplays[key];
        
        if (slider) slider.value = 0;
        if (valueDisplay) valueDisplay.textContent = '0';
    });
    
    updateImagePreview();
}

// Применение фильтров к изображению
function applyFiltersToImage() {
    if (!selectedImage) {
        showMessage('Не выбрано изображение', 'error');
        return;
    }
    
    showMessage('Применение фильтров...', 'info');
    
    if (!previewImage || !previewImage.src) {
        showMessage('Нет изображения для обработки', 'error');
        return;
    }
    
    // Создаем canvas для обработки
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = "anonymous";
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Применяем фильтры
        ctx.filter = generateFilterString();
        ctx.drawImage(img, 0, 0);
        
        // Конвертируем в Data URL
        const processedDataUrl = canvas.toDataURL('image/png');
        
        // Отправляем в Penpot через postMessage
        window.parent.postMessage({
            type: 'plugin-message',
            pluginId: 'image-editor',
            action: 'update-image',
            data: {
                id: selectedImage.id,
                imageUrl: processedDataUrl,
                filters: { ...currentFilters }
            }
        }, '*');
        
        showMessage('Фильтры применены!', 'success');
        
        // Скрываем сообщение через 2 секунды
        setTimeout(() => {
            if (errorMessage) errorMessage.style.display = 'none';
        }, 2000);
    };
    
    img.onerror = function() {
        showMessage('Ошибка загрузки изображения', 'error');
    };
    
    img.src = previewImage.src;
}

// Показать сообщение
function showMessage(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Устанавливаем цвет в зависимости от типа
        if (type === 'error') {
            errorMessage.style.color = 'var(--danger)';
        } else if (type === 'success') {
            errorMessage.style.color = 'green';
        } else {
            errorMessage.style.color = 'var(--text-secondary)';
        }
    }
}

// Применение темы
function applyTheme(theme) {
    const root = document.documentElement;
    if (!root) return;
    
    const colors = theme === 'dark' ? {
        'background': '#1F1F1F',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'primary': '#2680EB',
        'secondary': '#2D2D2D',
        'secondary-hover': '#3D3D3D',
        'slider-track': '#3D3D3D',
        'disabled': '#2D2D2D',
        'danger': '#E5484D'
    } : {
        'background': '#FFFFFF',
        'text-primary': '#000000',
        'text-secondary': '#666666',
        'primary': '#2680EB',
        'secondary': '#F0F0F0',
        'secondary-hover': '#E0E0E0',
        'slider-track': '#E0E0E0',
        'disabled': '#F5F5F5',
        'danger': '#E5484D'
    };
    
    Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
    });
    
    if (previewContainer) {
        previewContainer.style.backgroundColor = colors.background;
    }
}

// Обработка выделения
function handleSelection(selection) {
    console.log("Selection received:", selection);
    
    if (!selection || selection.length !== 1) {
        if (noImageMessage) noImageMessage.style.display = 'block';
        if (previewImage) previewImage.style.display = 'none';
        if (applyBtn) applyBtn.disabled = true;
        selectedImage = null;
        return;
    }
    
    const selected = selection[0];
    
    // Проверяем, является ли изображением
    if (selected.type === 'image' || selected.fillType === 'image') {
        selectedImage = selected;
        if (noImageMessage) noImageMessage.style.display = 'none';
        if (previewImage) previewImage.style.display = 'block';
        if (applyBtn) applyBtn.disabled = false;
        
        // Запрашиваем данные изображения
        window.parent.postMessage({
            type: 'plugin-message',
            pluginId: 'image-editor',
            action: 'get-image-data',
            data: { id: selected.id }
        }, '*');
        
    } else {
        if (noImageMessage) noImageMessage.style.display = 'block';
        if (previewImage) previewImage.style.display = 'none';
        if (applyBtn) applyBtn.disabled = true;
        selectedImage = null;
    }
}

// Обработка данных изображения
function handleImageData(data) {
    console.log("Image data received:", data);
    
    if (!previewImage || !data || !data.url) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = function() {
        previewImage.src = data.url;
        resetAllFilters(); // Сбрасываем фильтры для нового изображения
    };
    
    img.onerror = function() {
        showMessage('Ошибка загрузки изображения', 'error');
    };
    
    img.src = data.url;
}

// Обработчик сообщений от Penpot
window.addEventListener('message', function(event) {
    // Проверяем, что сообщение от родительского окна (Penpot)
    if (event.source !== window.parent) return;
    
    const message = event.data;
    console.log("Message from Penpot:", message);
    
    // Обрабатываем только сообщения для нашего плагина
    if (message.pluginId !== 'image-editor' && !message.type?.includes('image-editor')) {
        return;
    }
    
    switch(message.type || message.action) {
        case 'theme':
        case 'set-theme':
            applyTheme(message.data || message.theme);
            break;
            
        case 'selection':
        case 'set-selection':
            handleSelection(message.data || message.selection);
            break;
            
        case 'image-data':
        case 'set-image-data':
            handleImageData(message.data || message.imageData);
            break;
            
        case 'ready':
            console.log("Penpot ready, initializing plugin...");
            initializePlugin();
            
            // Запрашиваем текущую тему и выделение
            window.parent.postMessage({
                type: 'plugin-message',
                pluginId: 'image-editor',
                action: 'get-theme'
            }, '*');
            
            window.parent.postMessage({
                type: 'plugin-message',
                pluginId: 'image-editor',
                action: 'get-selection'
            }, '*');
            break;
    }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, waiting for Penpot...");
    
    // Сообщаем Penpot, что плагин готов
    window.parent.postMessage({
        type: 'plugin-message',
        pluginId: 'image-editor',
        action: 'ready'
    }, '*');
    
    // Также инициализируем элементы на всякий случай
    setTimeout(initializePlugin, 100);
});

// Если DOM уже загружен
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("DOM already loaded");
    window.parent.postMessage({
        type: 'plugin-message',
        pluginId: 'image-editor',
        action: 'ready'
    }, '*');
    
    setTimeout(initializePlugin, 100);
}

console.log("Plugin script loaded successfully");
