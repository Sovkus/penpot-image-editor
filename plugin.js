// Основные переменные
let selectedImage = null;
let originalImageData = null;
let currentFilters = {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0
};

// DOM элементы
const previewImage = document.getElementById('previewImage');
const noImageMessage = document.getElementById('noImage');
const previewContainer = document.getElementById('previewContainer');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const errorMessage = document.getElementById('errorMessage');

// Ползунки и их значения
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

// Инициализация плагина
window.addEventListener('DOMContentLoaded', () => {
    // Запрашиваем тему Penpot
    sendMessage({ type: 'get-theme' });
    
    // Запрашиваем текущее выделение
    sendMessage({ type: 'get-selection' });
    
    // Настройка слушателей событий для ползунков
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const valueDisplay = valueDisplays[key];
        
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            currentFilters[key] = value;
            valueDisplay.textContent = value;
            updateImagePreview();
        });
    });
    
    // Кнопка сброса
    resetBtn.addEventListener('click', resetAllFilters);
    
    // Кнопка применения
    applyBtn.addEventListener('click', applyFiltersToImage);
    
    // Обновляем интерфейс каждые 500мс для отслеживания выделения
    setInterval(() => {
        sendMessage({ type: 'get-selection' });
    }, 500);
});

// Обработчик сообщений от Penpot
window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return;
    
    const { type, data } = event.data;
    
    switch(type) {
        case 'theme':
            applyTheme(data);
            break;
            
        case 'selection':
            handleSelection(data);
            break;
            
        case 'image-data':
            handleImageData(data);
            break;
            
        case 'error':
            showError(data.message || 'Unknown error');
            break;
    }
});

// Применение темы Penpot
function applyTheme(theme) {
    const root = document.documentElement;
    
    // Устанавливаем CSS переменные в зависимости от темы
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
    
    // Применяем фон к контейнеру предпросмотра
    previewContainer.style.backgroundColor = colors.background;
}

// Обработка выделения в Penpot
function handleSelection(selection) {
    if (!selection || selection.length !== 1) {
        noImageMessage.style.display = 'block';
        previewImage.style.display = 'none';
        applyBtn.disabled = true;
        selectedImage = null;
        return;
    }
    
    const selected = selection[0];
    
    // Проверяем, является ли выделенный объект изображением
    if (selected.type === 'image' || selected.fillType === 'image') {
        selectedImage = selected;
        noImageMessage.style.display = 'none';
        previewImage.style.display = 'block';
        applyBtn.disabled = false;
        
        // Запрашиваем данные изображения
        sendMessage({
            type: 'get-image-data',
            data: { id: selected.id }
        });
    } else {
        noImageMessage.style.display = 'block';
        previewImage.style.display = 'none';
        applyBtn.disabled = true;
        selectedImage = null;
    }
}

// Обработка данных изображения
function handleImageData(data) {
    if (data.url) {
        // Создаем изображение для предпросмотра
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            previewImage.src = data.url;
            
            // Сохраняем оригинальные данные для сброса
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Сбрасываем фильтры
            resetAllFilters();
        };
        img.src = data.url;
    }
}

// Обновление предпросмотра изображения с фильтрами
function updateImagePreview() {
    if (!previewImage.src) return;
    
    const filterString = generateFilterString();
    previewImage.style.filter = filterString;
}

// Генерация строки CSS фильтра
function generateFilterString() {
    const f = currentFilters;
    const filters = [];
    
    // Exposure (яркость)
    if (f.exposure !== 0) {
        filters.push(`brightness(${1 + f.exposure / 100})`);
    }
    
    // Contrast
    if (f.contrast !== 0) {
        filters.push(`contrast(${1 + f.contrast / 100})`);
    }
    
    // Saturation
    if (f.saturation !== 0) {
        filters.push(`saturate(${1 + f.saturation / 100})`);
    }
    
    // Temperature (теплота/холодность через sepia и hue-rotate)
    if (f.temperature !== 0) {
        const temp = f.temperature / 100;
        if (temp > 0) {
            filters.push(`sepia(${temp})`);
        } else {
            filters.push(`hue-rotate(${temp * 180}deg)`);
        }
    }
    
    // Tint (оттенок через hue-rotate)
    if (f.tint !== 0) {
        filters.push(`hue-rotate(${f.tint * 1.8}deg)`);
    }
    
    // Highlights (блики) и Shadows (тени) - имитация через brightness
    if (f.highlights !== 0 || f.shadows !== 0) {
        // Упрощенная имитация - в реальности нужна более сложная обработка
        const brightness = 1 + (f.highlights - f.shadows) / 200;
        filters.push(`brightness(${brightness})`);
    }
    
    return filters.join(' ') || 'none';
}

// Сброс всех фильтров
function resetAllFilters() {
    Object.keys(currentFilters).forEach(key => {
        currentFilters[key] = 0;
        sliders[key].value = 0;
        valueDisplays[key].textContent = '0';
    });
    
    updateImagePreview();
}

// Применение фильтров к изображению в Penpot
function applyFiltersToImage() {
    if (!selectedImage) {
        showError('No image selected');
        return;
    }
    
    // В Penpot нет прямого API для применения CSS фильтров к изображениям
    // Поэтому нужно создать новый Canvas, применить фильтры и отправить как новое изображение
    
    showError('Applying filters...');
    
    // Создаем canvas для обработки изображения
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = "anonymous";
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Применяем фильтры через CSS
        canvas.style.filter = generateFilterString();
        
        // Рисуем изображение с фильтрами
        ctx.filter = generateFilterString();
        ctx.drawImage(img, 0, 0);
        
        // Конвертируем в Data URL
        const processedDataUrl = canvas.toDataURL('image/png');
        
        // Отправляем обратно в Penpot
        sendMessage({
            type: 'update-image',
            data: {
                id: selectedImage.id,
                imageUrl: processedDataUrl,
                filters: { ...currentFilters }
            }
        });
        
        showError('Filters applied successfully!');
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 2000);
    };
    
    img.onerror = () => {
        showError('Error loading image');
    };
    
    img.src = previewImage.src;
}

// Показать ошибку
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Отправить сообщение в Penpot
function sendMessage(message) {
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(message, '*');
    }
}

// Экспорт для Penpot
window.sendMessage = sendMessage;