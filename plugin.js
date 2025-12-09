// Ожидаем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Editor plugin loaded');
    
    // Инициализируем переменные
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const previewPlaceholder = document.getElementById('preview-placeholder');
    const infoText = document.querySelector('.info-text');
    
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
    document.getElementById('reset-btn').addEventListener('click', resetSettings);
    document.getElementById('apply-btn').addEventListener('click', applyToImage);
    
    // Настройка связи с Penpot
    setupPenpotCommunication();
    
    function initSliders() {
        const sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(`${sliderId}-value`);
            
            if (slider && valueDisplay) {
                slider.addEventListener('input', function(e) {
                    const value = parseInt(e.target.value);
                    currentSettings[sliderId] = value;
                    valueDisplay.textContent = value;
                    applyFilters();
                });
            }
        });
    }
    
    function setupPenpotCommunication() {
        console.log('Setting up Penpot communication...');
        
        // Слушаем сообщения от Penpot
        window.addEventListener('message', function(event) {
            console.log('Message from Penpot:', event.data);
            
            // Проверяем, что это сообщение от Penpot
            if (event.data && event.data.type) {
                handlePenpotMessage(event.data);
            }
        });
        
        // Отправляем сообщение о готовности
        setTimeout(() => {
            if (window.parent) {
                window.parent.postMessage({
                    type: 'penpot-plugin-ready',
                    name: 'image-editor',
                    version: '1.0.0'
                }, '*');
                console.log('Sent ready message to Penpot');
            }
        }, 100);
        
        updateStatus('Plugin loaded. Select an image in Penpot.');
    }
    
    function handlePenpotMessage(data) {
        console.log('Handling Penpot message:', data.type);
        
        switch(data.type) {
            case 'selection-change':
                handleSelectionChange(data.selection);
                break;
            case 'image-data':
                handleImageData(data);
                break;
            case 'apply-success':
                updateStatus('Filters applied successfully!');
                break;
            case 'apply-error':
                updateStatus('Error applying filters: ' + data.error);
                break;
        }
    }
    
    function handleSelectionChange(selection) {
        if (!selection || selection.length === 0) {
            clearPreview();
            updateStatus('No image selected. Select an image to edit.');
            return;
        }
        
        const selectedObject = selection[0];
        
        if (selectedObject.type === 'image') {
            updateStatus('Loading image...');
            
            // Запрашиваем данные изображения
            requestImageData(selectedObject.id);
        } else {
            clearPreview();
            updateStatus('Selected object is not an image.');
        }
    }
    
    function requestImageData(objectId) {
        if (window.parent) {
            window.parent.postMessage({
                type: 'request-image-data',
                objectId: objectId
            }, '*');
        }
    }
    
    function handleImageData(data) {
        if (!data.imageData) {
            updateStatus('Failed to load image data.');
            return;
        }
        
        // Загружаем изображение
        loadImage(data.imageData);
    }
    
    function loadImage(imageSrc) {
        const img = new Image();
        
        img.onload = function() {
            // Настраиваем canvas
            canvas.width = 208;
            canvas.height = 208;
            
            // Рассчитываем размеры для сохранения пропорций
            const scale = Math.min(
                208 / img.width,
                208 / img.height
            );
            
            const width = img.width * scale;
            const height = img.height * scale;
            const x = (208 - width) / 2;
            const y = (208 - height) / 2;
            
            // Очищаем и рисуем изображение
            ctx.clearRect(0, 0, 208, 208);
            ctx.drawImage(img, x, y, width, height);
            
            // Сохраняем оригинальные данные
            originalImageData = ctx.getImageData(0, 0, 208, 208);
            
            // Показываем canvas, скрываем placeholder
            canvas.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            
            updateStatus('Image loaded. Adjust settings below.');
            
            // Сбрасываем настройки
            resetSettings();
        };
        
        img.onerror = function() {
            updateStatus('Error loading image.');
            clearPreview();
        };
        
        img.src = imageSrc;
    }
    
    function clearPreview() {
        canvas.style.display = 'none';
        previewPlaceholder.style.display = 'flex';
        originalImageData = null;
    }
    
    function applyFilters() {
        if (!originalImageData) return;
        
        // Восстанавливаем оригинальное изображение
        ctx.putImageData(originalImageData, 0, 0);
        
        // Получаем текущие данные изображения
        const imageData = ctx.getImageData(0, 0, 208, 208);
        const data = imageData.data;
        
        // Применяем фильтры
        applyExposure(data);
        applyContrast(data);
        applySaturation(data);
        applyTemperatureTint(data);
        applyHighlightsShadows(data);
        
        // Возвращаем измененные данные
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyExposure(data) {
        if (currentSettings.exposure === 0) return;
        
        const factor = 1 + (currentSettings.exposure / 100);
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(data[i] * factor);
            data[i + 1] = clamp(data[i + 1] * factor);
            data[i + 2] = clamp(data[i + 2] * factor);
        }
    }
    
    function applyContrast(data) {
        if (currentSettings.contrast === 0) return;
        
        const factor = (259 * (currentSettings.contrast + 255)) / (255 * (259 - currentSettings.contrast));
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(factor * (data[i] - 128) + 128);
            data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
            data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
        }
    }
    
    function applySaturation(data) {
        if (currentSettings.saturation === 0) return;
        
        const factor = 1 + (currentSettings.saturation / 100);
        
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
    
    function applyTemperatureTint(data) {
        if (currentSettings.temperature === 0 && currentSettings.tint === 0) return;
        
        const temp = currentSettings.temperature / 100;
        const tint = currentSettings.tint / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // Temperature
            if (currentSettings.temperature !== 0) {
                data[i] = clamp(data[i] * (1 + temp));
                data[i + 2] = clamp(data[i + 2] * (1 - temp));
            }
            
            // Tint
            if (currentSettings.tint !== 0) {
                data[i] = clamp(data[i] * (1 + tint));
                data[i + 1] = clamp(data[i + 1] * (1 - tint));
            }
        }
    }
    
    function applyHighlightsShadows(data) {
        if (currentSettings.highlights === 0 && currentSettings.shadows === 0) return;
        
        const highlightsFactor = 1 + (currentSettings.highlights / 200);
        const shadowsFactor = 1 + (currentSettings.shadows / 200);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const brightness = (r + g + b) / 3;
            
            if (brightness > 150 && currentSettings.highlights !== 0) {
                data[i] = clamp(r * highlightsFactor);
                data[i + 1] = clamp(g * highlightsFactor);
                data[i + 2] = clamp(b * highlightsFactor);
            } else if (brightness < 100 && currentSettings.shadows !== 0) {
                data[i] = clamp(r * shadowsFactor);
                data[i + 1] = clamp(g * shadowsFactor);
                data[i + 2] = clamp(b * shadowsFactor);
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
            
            if (slider) {
                slider.value = 0;
                slider.dispatchEvent(new Event('input'));
            }
            if (valueDisplay) {
                valueDisplay.textContent = '0';
            }
        });
        
        // Восстанавливаем оригинальное изображение
        if (originalImageData) {
            ctx.putImageData(originalImageData, 0, 0);
        }
        
        updateStatus('Settings reset to default.');
    }
    
    function applyToImage() {
        if (!originalImageData) {
            updateStatus('No image loaded. Select an image first.');
            return;
        }
        
        updateStatus('Applying filters to image...');
        
        // Отправляем настройки в Penpot
        if (window.parent) {
            window.parent.postMessage({
                type: 'apply-filters',
                settings: currentSettings
            }, '*');
        }
    }
    
    function updateStatus(message) {
        console.log('Status:', message);
        if (infoText) {
            infoText.textContent = message;
        }
    }
});
