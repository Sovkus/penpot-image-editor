// Penpot плагины используют специальный API, а не стандартные window/document
// Этот код должен выполняться в глобальной области видимости плагина

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

// Инициализация плагина при загрузке
console.log("Image Editor Plugin loading...");

// Penpot предоставляет специальный API для работы с DOM
// Ждем, когда Penpot загрузит интерфейс плагина
function initializePlugin() {
    console.log("Initializing plugin...");
    
    try {
        // Получаем элементы после того как Penpot создаст DOM
        const previewImage = document.getElementById('previewImage');
        const noImageMessage = document.getElementById('noImage');
        const applyBtn = document.getElementById('applyBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        console.log("DOM elements found:", {
            previewImage: !!previewImage,
            noImageMessage: !!noImageMessage,
            applyBtn: !!applyBtn,
            resetBtn: !!resetBtn
        });
        
        // Инициализируем ползунки
        const sliderIds = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
        
        sliderIds.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(sliderId + 'Value');
            
            if (slider && valueDisplay) {
                slider.addEventListener('input', function(e) {
                    const value = parseInt(e.target.value);
                    currentFilters[sliderId] = value;
                    valueDisplay.textContent = value;
                    updateImagePreview();
                });
            }
        });
        
        // Настройка кнопок
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                resetAllFilters();
            });
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                applyFiltersToImage();
            });
        }
        
        // Запрашиваем тему и выделение у Penpot
        penpot.sendMessage({ type: 'get-theme' });
        penpot.sendMessage({ type: 'get-selection' });
        
        console.log("Plugin initialized successfully");
        
    } catch (error) {
        console.error("Error initializing plugin:", error);
    }
}

// Функция обновления предпросмотра
function updateImagePreview() {
    const previewImage = document.getElementById('previewImage');
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
        
        const slider = document.getElementById(key);
        const valueDisplay = document.getElementById(key + 'Value');
        
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
    
    const previewImage = document.getElementById('previewImage');
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
        
        // Отправляем в Penpot
        penpot.sendMessage({
            type: 'update-image',
            data: {
                id: selectedImage.id,
                imageUrl: processedDataUrl,
                filters: { ...currentFilters }
            }
        });
        
        showMessage('Фильтры применены!', 'success');
    };
    
    img.onerror = function() {
        showMessage('Ошибка загрузки изображения', 'error');
    };
    
    img.src = previewImage.src;
}

// Показать сообщение
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('errorMessage');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        
        // Убираем сообщение через 3 секунды
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
    
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Обработчик сообщений от Penpot
if (typeof penpot !== 'undefined') {
    penpot.onMessage(function(data) {
        console.log("Message from Penpot:", data);
        
        switch(data.type) {
            case 'theme':
                applyTheme(data.data);
                break;
                
            case 'selection':
                handleSelection(data.data);
                break;
                
            case 'image-data':
                handleImageData(data.data);
                break;
        }
    });
} else {
    // Fallback для отладки
    console.warn("Penpot API not found, using fallback");
    window.addEventListener('message', function(event) {
        if (event.source !== window.parent) return;
        console.log("Fallback message:", event.data);
    });
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
    
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
        previewContainer.style.backgroundColor = colors.background;
    }
}

// Обработка выделения
function handleSelection(selection) {
    console.log("Selection received:", selection);
    
    const noImageMessage = document.getElementById('noImage');
    const previewImage = document.getElementById('previewImage');
    const applyBtn = document.getElementById('applyBtn');
    
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
        penpot.sendMessage({
            type: 'get-image-data',
            data: { id: selected.id }
        });
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
    
    const previewImage = document.getElementById('previewImage');
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

// Запускаем инициализацию с небольшой задержкой
// чтобы Penpot успел создать DOM
setTimeout(initializePlugin, 100);
