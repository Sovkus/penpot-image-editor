// Penpot Image Editor Plugin
// Эта структура работает в Penpot

(function() {
    'use strict';
    
    // Создаем объект плагина
    var ImageEditorPlugin = {
        create: function() {
            console.log('Image Editor Plugin: create() called');
            
            return {
                html: getHTML(),
                css: getCSS(),
                onMount: onMount,
                onMessage: onMessage
            };
        }
    };
    
    // HTML содержимое
    function getHTML() {
        return `
            <div class="container">
                <div class="preview-section">
                    <div class="preview-container">
                        <canvas id="preview-canvas" width="208" height="208"></canvas>
                        <div class="preview-placeholder" id="preview-placeholder">
                            Select an image<br>in Penpot to edit
                        </div>
                    </div>
                    
                    <div class="controls">
                        <div class="control-group">
                            <div class="control-label">
                                <span>Exposure</span>
                                <span class="control-value" id="exposure-value">0</span>
                            </div>
                            <div class="slider-container">
                                <input type="range" id="exposure" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>

                        <div class="control-group">
                            <div class="control-label">
                                <span>Contrast</span>
                                <span class="control-value" id="contrast-value">0</span>
                            </div>
                            <div class="slider-container">
                                <input type="range" id="contrast" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>

                        <div class="control-group">
                            <div class="control-label">
                                <span>Saturation</span>
                                <span class="control-value" id="saturation-value">0</span>
                            </div>
                            <div class="slider-container">
                                <input type="range" id="saturation" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>

                        <div class="control-group">
                            <div class="control-label">
                                <span>Temperature</span>
                                <span class="control-value" id="temperature-value">0</span>
                            </div>
                            <div class="slider-container">
                                <input type="range" id="temperature" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>

                        <div class="control-group">
                            <div class="control-label">
                                <span>Tint</span>
                                <span class="control-value" id="tint-value">0</span>
                            </div>
                            <div class="slider-container">
                                <input type="range" id="tint" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>

                        <div class="control-group">
                            <div class="control-label">
                                <span>Highlights</span>
                                <span class="control-value" id="highlights-value">0</span>
                            </div>
                            <div class="slider-container">
                                <input type="range" id="highlights" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>

                        <div class="control-group">
                            <div class="control-label">
                                <span>Shadows</span>
                                <span class="control-value" id="shadows-value">0</span>
                            </div>
                            <div class="slider-container">
                                <input type="range" id="shadows" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="buttons">
                    <button id="reset-btn">Reset All</button>
                    <button id="apply-btn" class="primary">Apply to Image</button>
                </div>

                <div class="info-text" id="info-text">
                    Adjust sliders to edit the selected image
                </div>
            </div>
        `;
    }
    
    // CSS стили
    function getCSS() {
        return `
            .container {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: transparent;
                color: var(--penpot-text-primary);
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                height: 100%;
            }
            
            .preview-section {
                display: flex;
                gap: 20px;
                align-items: flex-start;
            }
            
            .preview-container {
                width: 208px;
                height: 208px;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                background: var(--penpot-background-secondary);
                border: 1px solid var(--penpot-border-primary);
            }
            
            #preview-canvas {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: none;
            }
            
            .preview-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--penpot-text-secondary);
                font-size: 14px;
                text-align: center;
                padding: 20px;
            }
            
            .controls {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .control-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .control-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: var(--penpot-text-primary);
            }
            
            .control-value {
                font-feature-settings: 'tnum' 1;
                min-width: 36px;
                text-align: right;
            }
            
            .slider-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            input[type="range"] {
                flex: 1;
                height: 4px;
                -webkit-appearance: none;
                background: var(--penpot-border-primary);
                border-radius: 2px;
                outline: none;
            }
            
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--penpot-primary);
                cursor: pointer;
                border: 2px solid var(--penpot-background-primary);
            }
            
            input[type="range"]::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--penpot-primary);
                cursor: pointer;
                border: 2px solid var(--penpot-background-primary);
            }
            
            .buttons {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
            
            button {
                flex: 1;
                padding: 8px 16px;
                border-radius: 4px;
                border: 1px solid var(--penpot-border-primary);
                background: var(--penpot-background-secondary);
                color: var(--penpot-text-primary);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            button:hover {
                background: var(--penpot-background-tertiary);
                border-color: var(--penpot-border-secondary);
            }
            
            button.primary {
                background: var(--penpot-primary);
                color: white;
                border-color: var(--penpot-primary);
            }
            
            button.primary:hover {
                background: var(--penpot-primary-dark);
            }
            
            .info-text {
                font-size: 11px;
                color: var(--penpot-text-secondary);
                text-align: center;
                margin-top: 8px;
                font-style: italic;
            }
        `;
    }
    
    // Переменные для состояния плагина
    var canvas, ctx, previewPlaceholder, infoText;
    var originalImageData = null;
    var settings = {
        exposure: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0
    };
    
    // Функция, вызываемая при монтировании плагина
    function onMount(root) {
        console.log('Image Editor Plugin: onMount() called', root);
        
        // Инициализируем элементы
        canvas = root.querySelector('#preview-canvas');
        ctx = canvas.getContext('2d');
        previewPlaceholder = root.querySelector('#preview-placeholder');
        infoText = root.querySelector('#info-text');
        
        // Инициализируем слайдеры
        initSliders(root);
        
        // Инициализируем кнопки
        initButtons(root);
        
        // Устанавливаем начальный статус
        updateStatus('Select an image in Penpot to edit');
        
        // Запрашиваем выделение
        requestSelection();
        
        // Начинаем опрос выделения
        startSelectionPolling();
        
        console.log('Image Editor Plugin initialized');
    }
    
    // Инициализация слайдеров
    function initSliders(root) {
        var sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
        
        sliders.forEach(function(sliderId) {
            var slider = root.querySelector('#' + sliderId);
            var valueDisplay = root.querySelector('#' + sliderId + '-value');
            
            if (slider && valueDisplay) {
                slider.addEventListener('input', function(e) {
                    var value = parseInt(e.target.value);
                    settings[sliderId] = value;
                    valueDisplay.textContent = value;
                    applyFilters();
                });
            }
        });
    }
    
    // Инициализация кнопок
    function initButtons(root) {
        var resetBtn = root.querySelector('#reset-btn');
        var applyBtn = root.querySelector('#apply-btn');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetSettings);
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', applyToImage);
        }
    }
    
    // Опрос выделения
    function startSelectionPolling() {
        setInterval(function() {
            requestSelection();
        }, 1000);
    }
    
    // Запрос выделения
    function requestSelection() {
        if (window.parent) {
            window.parent.postMessage({
                type: 'get-selection',
                source: 'image-editor-plugin'
            }, '*');
        }
    }
    
    // Обработка сообщений от Penpot
    function onMessage(data) {
        console.log('Image Editor Plugin: onMessage()', data);
        
        if (!data || !data.type) return;
        
        switch(data.type) {
            case 'selection':
                handleSelection(data.objects);
                break;
            case 'image-data':
                handleImageData(data);
                break;
            case 'success':
                updateStatus(data.message || 'Success');
                break;
            case 'error':
                updateStatus('Error: ' + (data.message || 'Unknown error'));
                break;
        }
    }
    
    // Обработка выделения
    function handleSelection(objects) {
        if (!objects || objects.length === 0) {
            clearPreview();
            updateStatus('No image selected');
            return;
        }
        
        var firstObject = objects[0];
        
        if (firstObject.type === 'image' && firstObject.id) {
            updateStatus('Loading image...');
            
            // Запрашиваем данные изображения
            if (window.parent) {
                window.parent.postMessage({
                    type: 'get-image-data',
                    id: firstObject.id,
                    source: 'image-editor-plugin'
                }, '*');
            }
        } else {
            updateStatus('Please select an image');
            clearPreview();
        }
    }
    
    // Обработка данных изображения
    function handleImageData(data) {
        if (!data || !data.url) {
            updateStatus('Failed to load image');
            return;
        }
        
        loadImage(data.url);
    }
    
    // Загрузка изображения
    function loadImage(imageUrl) {
        var img = new Image();
        
        img.onload = function() {
            // Настраиваем canvas
            canvas.width = 208;
            canvas.height = 208;
            
            // Рассчитываем размеры с сохранением пропорций
            var scale = Math.min(
                208 / img.width,
                208 / img.height
            );
            
            var width = img.width * scale;
            var height = img.height * scale;
            var x = (208 - width) / 2;
            var y = (208 - height) / 2;
            
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
    
    // Очистка превью
    function clearPreview() {
        canvas.style.display = 'none';
        previewPlaceholder.style.display = 'flex';
        originalImageData = null;
    }
    
    // Применение фильтров
    function applyFilters() {
        if (!originalImageData) return;
        
        // Восстанавливаем оригинал
        ctx.putImageData(originalImageData, 0, 0);
        
        // Получаем данные для обработки
        var imageData = ctx.getImageData(0, 0, 208, 208);
        var data = imageData.data;
        
        // Применяем фильтры
        applyExposure(data);
        applyContrast(data);
        applySaturation(data);
        applyTemperatureTint(data);
        applyHighlightsShadows(data);
        
        // Возвращаем обработанные данные
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Фильтры
    function applyExposure(data) {
        if (settings.exposure === 0) return;
        
        var factor = 1 + (settings.exposure / 100);
        
        for (var i = 0; i < data.length; i += 4) {
            data[i] = clamp(data[i] * factor);
            data[i + 1] = clamp(data[i + 1] * factor);
            data[i + 2] = clamp(data[i + 2] * factor);
        }
    }
    
    function applyContrast(data) {
        if (settings.contrast === 0) return;
        
        var factor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
        
        for (var i = 0; i < data.length; i += 4) {
            data[i] = clamp(factor * (data[i] - 128) + 128);
            data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
            data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
        }
    }
    
    function applySaturation(data) {
        if (settings.saturation === 0) return;
        
        var factor = 1 + (settings.saturation / 100);
        
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            
            var gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            
            data[i] = clamp(gray + factor * (r - gray));
            data[i + 1] = clamp(gray + factor * (g - gray));
            data[i + 2] = clamp(gray + factor * (b - gray));
        }
    }
    
    function applyTemperatureTint(data) {
        if (settings.temperature === 0 && settings.tint === 0) return;
        
        var temp = settings.temperature / 100;
        var tint = settings.tint / 100;
        
        for (var i = 0; i < data.length; i += 4) {
            if (settings.temperature !== 0) {
                data[i] = clamp(data[i] * (1 + temp));
                data[i + 2] = clamp(data[i + 2] * (1 - temp));
            }
            
            if (settings.tint !== 0) {
                data[i] = clamp(data[i] * (1 + tint));
                data[i + 1] = clamp(data[i + 1] * (1 - tint));
            }
        }
    }
    
    function applyHighlightsShadows(data) {
        if (settings.highlights === 0 && settings.shadows === 0) return;
        
        var highlightsFactor = 1 + (settings.highlights / 200);
        var shadowsFactor = 1 + (settings.shadows / 200);
        
        for (var i = 0; i < data.length; i += 4) {
            var brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            if (brightness > 150 && settings.highlights !== 0) {
                data[i] = clamp(data[i] * highlightsFactor);
                data[i + 1] = clamp(data[i + 1] * highlightsFactor);
                data[i + 2] = clamp(data[i + 2] * highlightsFactor);
            } else if (brightness < 100 && settings.shadows !== 0) {
                data[i] = clamp(data[i] * shadowsFactor);
                data[i + 1] = clamp(data[i + 1] * shadowsFactor);
                data[i + 2] = clamp(data[i + 2] * shadowsFactor);
            }
        }
    }
    
    // Вспомогательные функции
    function clamp(value) {
        return Math.max(0, Math.min(255, value));
    }
    
    function resetSettings() {
        settings = {
            exposure: 0,
            contrast: 0,
            saturation: 0,
            temperature: 0,
            tint: 0,
            highlights: 0,
            shadows: 0
        };
        
        // Сбрасываем слайдеры
        var sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
        
        sliders.forEach(function(sliderId) {
            var slider = document.getElementById(sliderId);
            var valueDisplay = document.getElementById(sliderId + '-value');
            
            if (slider) slider.value = 0;
            if (valueDisplay) valueDisplay.textContent = '0';
        });
        
        // Восстанавливаем оригинальное изображение
        if (originalImageData) {
            ctx.putImageData(originalImageData, 0, 0);
        }
        
        updateStatus('Settings reset');
    }
    
    function applyToImage() {
        if (!originalImageData) {
            updateStatus('No image loaded');
            return;
        }
        
        updateStatus('Applying filters...');
        
        if (window.parent) {
            window.parent.postMessage({
                type: 'apply-filters',
                settings: settings,
                source: 'image-editor-plugin'
            }, '*');
        }
    }
    
    function updateStatus(message) {
        console.log('Status:', message);
        if (infoText) {
            infoText.textContent = message;
        }
    }
    
    // Экспортируем плагин
    if (typeof window !== 'undefined') {
        window.PenpotPlugin = ImageEditorPlugin;
    }
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ImageEditorPlugin;
    }
})();
