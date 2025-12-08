// Убедимся, что код выполняется после полной загрузки DOM
(function() {
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

    // DOM элементы будут получены после загрузки
    let previewImage, noImageMessage, previewContainer, applyBtn, resetBtn, errorMessage;
    let sliders = {};
    let valueDisplays = {};

    // Инициализация после загрузки DOM
    function init() {
        console.log('Плагин инициализируется...');
        
        // Получаем элементы DOM
        previewImage = document.getElementById('previewImage');
        noImageMessage = document.getElementById('noImage');
        previewContainer = document.getElementById('previewContainer');
        applyBtn = document.getElementById('applyBtn');
        resetBtn = document.getElementById('resetBtn');
        errorMessage = document.getElementById('errorMessage');

        // Инициализируем ползунки
        const sliderNames = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
        
        sliderNames.forEach(name => {
            const slider = document.getElementById(name);
            const valueDisplay = document.getElementById(name + 'Value');
            
            if (slider && valueDisplay) {
                sliders[name] = slider;
                valueDisplays[name] = valueDisplay;
                
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    currentFilters[name] = value;
                    valueDisplay.textContent = value;
                    updateImagePreview();
                });
            }
        });

        // Настройка кнопок
        if (resetBtn) {
            resetBtn.addEventListener('click', resetAllFilters);
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', applyFiltersToImage);
        }

        // Запрашиваем тему Penpot
        sendMessage({ type: 'get-theme' });
        
        // Запрашиваем текущее выделение
        sendMessage({ type: 'get-selection' });
        
        // Периодически проверяем выделение
        setInterval(() => {
            sendMessage({ type: 'get-selection' });
        }, 500);

        console.log('Плагин готов к работе');
    }

    // Обработчик сообщений от Penpot
    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return;
        
        const { type, data } = event.data;
        console.log('Получено сообщение от Penpot:', type, data);
        
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
                showError(data?.message || 'Unknown error');
                break;
        }
    });

    // Применение темы Penpot
    function applyTheme(theme) {
        console.log('Применение темы:', theme);
        const root = document.documentElement;
        
        if (!root) return;
        
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
        if (previewContainer) {
            previewContainer.style.backgroundColor = colors.background;
        }
    }

    // Обработка выделения в Penpot
    function handleSelection(selection) {
        console.log('Обработка выделения:', selection);
        
        if (!selection || selection.length !== 1) {
            if (noImageMessage) noImageMessage.style.display = 'block';
            if (previewImage) previewImage.style.display = 'none';
            if (applyBtn) applyBtn.disabled = true;
            selectedImage = null;
            return;
        }
        
        const selected = selection[0];
        
        // Проверяем, является ли выделенный объект изображением
        if (selected.type === 'image' || selected.fillType === 'image') {
            selectedImage = selected;
            if (noImageMessage) noImageMessage.style.display = 'none';
            if (previewImage) previewImage.style.display = 'block';
            if (applyBtn) applyBtn.disabled = false;
            
            // Запрашиваем данные изображения
            sendMessage({
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
        console.log('Получены данные изображения:', data);
        
        if (data && data.url && previewImage) {
            // Создаем изображение для предпросмотра
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            img.onload = () => {
                previewImage.src = data.url;
                
                // Сбрасываем фильтры
                resetAllFilters();
            };
            
            img.onerror = (err) => {
                console.error('Ошибка загрузки изображения:', err);
                showError('Ошибка загрузки изображения');
            };
            
            img.src = data.url;
        } else {
            showError('Нет данных изображения');
        }
    }

    // Обновление предпросмотра изображения с фильтрами
    function updateImagePreview() {
        if (!previewImage || !previewImage.src) return;
        
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
        
        // Temperature (теплота/холодность)
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
        
        // Highlights и Shadows
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
            if (sliders[key]) {
                sliders[key].value = 0;
            }
            if (valueDisplays[key]) {
                valueDisplays[key].textContent = '0';
            }
        });
        
        updateImagePreview();
    }

    // Применение фильтров к изображению в Penpot
    function applyFiltersToImage() {
        if (!selectedImage) {
            showError('Не выбрано изображение');
            return;
        }
        
        showError('Применение фильтров...');
        
        // Создаем canvas для обработки изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Применяем фильтры
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
            
            showError('Фильтры применены успешно!');
            setTimeout(() => {
                if (errorMessage) errorMessage.style.display = 'none';
            }, 2000);
        };
        
        img.onerror = () => {
            showError('Ошибка загрузки изображения');
        };
        
        img.src = previewImage.src;
    }

    // Показать ошибку
    function showError(message) {
        console.error('Ошибка плагина:', message);
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    // Отправить сообщение в Penpot
    function sendMessage(message) {
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage(message, '*');
        }
    }

    // Запуск инициализации после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM уже загружен
        init();
    }

    // Экспорт для отладки
    window.pluginAPI = {
        sendMessage,
        resetAllFilters,
        applyFiltersToImage,
        updateImagePreview,
        generateFilterString
    };
})();
