// Проверяем, что DOM загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
} else {
    initPlugin();
}

function initPlugin() {
    console.log('Penpot Image Editor plugin initializing...');
    
    // Получаем элементы
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const previewPlaceholder = document.getElementById('preview-placeholder');
    const infoText = document.getElementById('info-text');
    
    let originalImageData = null;
    let currentSettings = {
        exposure: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0
    };
    
    // Инициализация слайдеров
    initSliders();
    
    // Инициализация кнопок
    initButtons();
    
    // Устанавливаем связь с Penpot
    setupPenpotConnection();
    
    function initSliders() {
        const sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(`${sliderId}-value`);
            
            if (slider && valueDisplay) {
                // Устанавливаем начальное значение
                valueDisplay.textContent = '0';
                
                // Добавляем обработчик
                slider.addEventListener('input', function(e) {
                    const value = parseInt(e.target.value);
                    currentSettings[sliderId] = value;
                    valueDisplay.textContent = value;
                    
                    // Применяем фильтры
                    if (originalImageData) {
                        applyFilters();
                    }
                });
            }
        });
    }
    
    function initButtons() {
        const resetBtn = document.getElementById('reset-btn');
        const applyBtn = document.getElementById('apply-btn');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetSettings);
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', applyToImage);
        }
    }
    
    function setupPenpotConnection() {
        // Слушаем сообщения от Penpot
        window.addEventListener('message', function(event) {
            console.log('Message from Penpot:', event.data);
            
            // Обрабатываем сообщения
            if (event.data && event.data.type) {
                handlePenpotMessage(event.data);
            }
        });
        
        // Отправляем сообщение о готовности
        setTimeout(() => {
            sendToPenpot({
                type: 'plugin-ready',
                name: 'image-editor'
            });
            updateStatus('Plugin ready. Select an image in Penpot.');
        }, 500);
    }
    
    function sendToPenpot(message) {
        if (window.parent) {
            window.parent.postMessage(message, '*');
        }
    }
    
    function handlePenpotMessage(data) {
        console.log('Processing message:', data.type);
        
        switch(data.type) {
            case 'selection-changed':
                handleSelection(data.objects);
                break;
            case 'image-loaded':
                loadImage(data.url);
                break;
            case 'filters-applied':
                updateStatus('Filters applied successfully!');
                break;
        }
    }
    
    function handleSelection(objects) {
        if (!objects || objects.length === 0) {
            clearPreview();
            updateStatus('No image selected');
            return;
        }
        
        const firstObject = objects[0];
        
        if (firstObject.type === 'image' && firstObject.id) {
            updateStatus('Loading image...');
            
            // Запрашиваем изображение
            sendToPenpot({
                type: 'request-image',
                id: firstObject.id
            });
        } else {
            updateStatus('Please select an image');
            clearPreview();
        }
    }
    
    function loadImage(imageUrl) {
        const img = new Image();
        
        img.onload = function() {
            // Настраиваем размеры canvas
            canvas.width = 208;
            canvas.height = 208;
            
            // Рассчитываем размеры с сохранением пропорций
            const scale = Math.min(
                208 / img.width,
                208 / img.height
            );
            
            const width = img.width * scale;
            const height = img.height * scale;
            const x = (208 - width) / 2;
            const y = (208 - height) / 2;
            
            // Очищаем и рисуем
            ctx.clearRect(0, 0, 208, 208);
            ctx.drawImage(img, x, y, width, height);
            
            // Сохраняем оригинальные данные
            originalImageData = ctx.getImageData(0, 0, 208, 208);
            
            // Показываем canvas
            canvas.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            
            updateStatus('Image loaded. Adjust settings.');
            
            // Сбрасываем настройки
            resetSettings();
        };
        
        img.onerror = function() {
            updateStatus('Error loading image');
            clearPreview();
        };
        
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
    }
    
    function clearPreview() {
        canvas.style.display = 'none';
        previewPlaceholder.style.display = 'flex';
        originalImageData = null;
    }
    
    function applyFilters() {
        if (!originalImageData) return;
        
        // Восстанавливаем оригинал
        ctx.putImageData(originalImageData, 0, 0);
        
        // Получаем данные для обработки
        const imageData = ctx.getImageData(0, 0, 208, 208);
        const data = imageData.data;
        
        // Применяем все фильтры
        applyFilter(data, 'exposure');
        applyFilter(data, 'contrast');
        applyFilter(data, 'saturation');
        applyFilter(data, 'temperature');
        applyFilter(data, 'tint');
        applyFilter(data, 'highlights');
        applyFilter(data, 'shadows');
        
        // Возвращаем обработанные данные
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyFilter(data, filterName) {
        const value = currentSettings[filterName];
        if (value === 0) return;
        
        switch(filterName) {
            case 'exposure':
                applyExposure(data, value);
                break;
            case 'contrast':
                applyContrast(data, value);
                break;
            case 'saturation':
                applySaturation(data, value);
                break;
            case 'temperature':
                applyTemperature(data, value);
                break;
            case 'tint':
                applyTint(data, value);
                break;
            case 'highlights':
                applyHighlights(data, value);
                break;
            case 'shadows':
                applyShadows(data, value);
                break;
        }
    }
    
    function applyExposure(data, value) {
        const factor = 1 + (value / 100);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(data[i] * factor);
            data[i + 1] = clamp(data[i + 1] * factor);
            data[i + 2] = clamp(data[i + 2] * factor);
        }
    }
    
    function applyContrast(data, value) {
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(factor * (data[i] - 128) + 128);
            data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
            data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
        }
    }
    
    function applySaturation(data, value) {
        const factor = 1 + (value / 100);
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            
            data[i] = clamp(gray + factor * (r - gray));
            data[i + 1] = clamp(gray + factor * (g - gray));
            data[i + 2] = clamp(gray + factor * (b - gray));
        }
    }
    
    function applyTemperature(data, value) {
        const factor = value / 100;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(data[i] * (1 + factor));
            data[i + 2] = clamp(data[i + 2] * (1 - factor));
        }
    }
    
    function applyTint(data, value) {
        const factor = value / 100;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(data[i] * (1 + factor));
            data[i + 1] = clamp(data[i + 1] * (1 - factor));
        }
    }
    
    function applyHighlights(data, value) {
        const factor = 1 + (value / 200);
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 150) {
                data[i] = clamp(data[i] * factor);
                data[i + 1] = clamp(data[i + 1] * factor);
                data[i + 2] = clamp(data[i + 2] * factor);
            }
        }
    }
    
    function applyShadows(data, value) {
        const factor = 1 + (value / 200);
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness < 100) {
                data[i] = clamp(data[i] * factor);
                data[i + 1] = clamp(data[i + 1] * factor);
                data[i + 2] = clamp(data[i + 2] * factor);
            }
        }
    }
    
    function clamp(value) {
        return Math.max(0, Math.min(255, value));
    }
    
    function resetSettings() {
        currentSettings = {
            exposure: 0,
            contrast: 0,
            saturation: 0,
            temperature: 0,
            tint: 0,
            highlights: 0,
            shadows: 0
        };
        
        // Сбрасываем слайдеры
        Object.keys(currentSettings).forEach(key => {
            const slider = document.getElementById(key);
            const valueDisplay = document.getElementById(`${key}-value`);
            
            if (slider) slider.value = 0;
            if (valueDisplay) valueDisplay.textContent = '0';
        });
        
        // Восстанавливаем изображение
        if (originalImageData) {
            ctx.putImageData(originalImageData, 0, 0);
        }
        
        updateStatus('Settings reset');
    }
    
    function applyToImage() {
        if (!originalImageData) {
            updateStatus('No image to apply');
            return;
        }
        
        updateStatus('Applying filters...');
        
        sendToPenpot({
            type: 'apply-filters',
            settings: currentSettings
        });
    }
    
    function updateStatus(message) {
        console.log('Status:', message);
        if (infoText) {
            infoText.textContent = message;
        }
    }
}
