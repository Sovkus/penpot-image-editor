// plugin.js - Правильный экспорт для Penpot
console.log('🎨 IMAGE EDITOR PLUGIN: Script loaded');

// Penpot использует CommonJS систему
// Нужно использовать exports, а не module.exports

// Определяем плагин
var plugin = {
    create: function() {
        console.log('✅ IMAGE EDITOR: create() method called!');
        
        return {
            // HTML интерфейс
            html: `
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
                                <input type="range" id="exposure" min="-100" max="100" value="0" step="1">
                            </div>
                            
                            <div class="control-group">
                                <div class="control-label">
                                    <span>Contrast</span>
                                    <span class="control-value" id="contrast-value">0</span>
                                </div>
                                <input type="range" id="contrast" min="-100" max="100" value="0" step="1">
                            </div>
                            
                            <div class="control-group">
                                <div class="control-label">
                                    <span>Saturation</span>
                                    <span class="control-value" id="saturation-value">0</span>
                                </div>
                                <input type="range" id="saturation" min="-100" max="100" value="0" step="1">
                            </div>
                            
                            <div class="control-group">
                                <div class="control-label">
                                    <span>Temperature</span>
                                    <span class="control-value" id="temperature-value">0</span>
                                </div>
                                <input type="range" id="temperature" min="-100" max="100" value="0" step="1">
                            </div>
                            
                            <div class="control-group">
                                <div class="control-label">
                                    <span>Tint</span>
                                    <span class="control-value" id="tint-value">0</span>
                                </div>
                                <input type="range" id="tint" min="-100" max="100" value="0" step="1">
                            </div>
                            
                            <div class="control-group">
                                <div class="control-label">
                                    <span>Highlights</span>
                                    <span class="control-value" id="highlights-value">0</span>
                                </div>
                                <input type="range" id="highlights" min="-100" max="100" value="0" step="1">
                            </div>
                            
                            <div class="control-group">
                                <div class="control-label">
                                    <span>Shadows</span>
                                    <span class="control-value" id="shadows-value">0</span>
                                </div>
                                <input type="range" id="shadows" min="-100" max="100" value="0" step="1">
                            </div>
                        </div>
                    </div>
                    
                    <div class="buttons">
                        <button id="reset-btn">Reset All</button>
                        <button id="apply-btn" class="primary">Apply to Image</button>
                    </div>
                    
                    <div class="info-text" id="info-text">
                        Plugin loaded. Select an image.
                    </div>
                </div>
            `,
            
            // CSS стили
            css: `
                .container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 16px;
                    color: var(--penpot-text-primary);
                    background: transparent;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
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
                    background: var(--penpot-background-secondary);
                    border: 1px solid var(--penpot-border-primary);
                    position: relative;
                }
                
                #preview-canvas {
                    width: 100%;
                    height: 100%;
                    display: none;
                }
                
                .preview-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--penpot-text-secondary);
                    text-align: center;
                    font-size: 14px;
                    padding: 20px;
                }
                
                .controls {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .control-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                }
                
                .control-value {
                    min-width: 36px;
                    text-align: right;
                }
                
                input[type="range"] {
                    width: 100%;
                    height: 4px;
                    background: var(--penpot-border-primary);
                    border-radius: 2px;
                }
                
                .buttons {
                    display: flex;
                    gap: 8px;
                }
                
                button {
                    flex: 1;
                    padding: 8px 16px;
                    border-radius: 4px;
                    border: 1px solid var(--penpot-border-primary);
                    background: var(--penpot-background-secondary);
                    color: var(--penpot-text-primary);
                    cursor: pointer;
                    font-size: 12px;
                }
                
                button.primary {
                    background: var(--penpot-primary);
                    color: white;
                    border-color: var(--penpot-primary);
                }
                
                .info-text {
                    font-size: 11px;
                    color: var(--penpot-text-secondary);
                    text-align: center;
                    margin-top: 8px;
                }
            `,
            
            // Метод вызываемый при монтировании
            onMount: function(root) {
                console.log('✅ IMAGE EDITOR: onMount() - Plugin is visible!', root);
                
                // Инициализируем элементы
                var canvas = root.querySelector('#preview-canvas');
                var ctx = canvas.getContext('2d');
                var placeholder = root.querySelector('#preview-placeholder');
                var infoText = root.querySelector('#info-text');
                
                // Инициализируем слайдеры
                var sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
                sliders.forEach(function(sliderId) {
                    var slider = root.querySelector('#' + sliderId);
                    var valueDisplay = root.querySelector('#' + sliderId + '-value');
                    
                    if (slider && valueDisplay) {
                        slider.addEventListener('input', function() {
                            valueDisplay.textContent = this.value;
                        });
                    }
                });
                
                // Кнопка сброса
                root.querySelector('#reset-btn').addEventListener('click', function() {
                    sliders.forEach(function(sliderId) {
                        var slider = root.querySelector('#' + sliderId);
                        var valueDisplay = root.querySelector('#' + sliderId + '-value');
                        if (slider) slider.value = 0;
                        if (valueDisplay) valueDisplay.textContent = '0';
                    });
                    if (infoText) infoText.textContent = 'Settings reset';
                });
                
                // Кнопка применения
                root.querySelector('#apply-btn').addEventListener('click', function() {
                    if (infoText) infoText.textContent = 'Applying filters...';
                });
                
                // Обновляем статус
                if (infoText) {
                    infoText.textContent = 'Ready. Select an image in Penpot.';
                }
                
                // Запрашиваем текущее выделение
                if (window.parent) {
                    window.parent.postMessage({
                        type: 'get-selection',
                        source: 'image-editor'
                    }, '*');
                }
            },
            
            // Обработчик сообщений от Penpot
            onMessage: function(data) {
                console.log('📨 IMAGE EDITOR: Message received:', data);
            }
        };
    }
};

// Экспортируем плагин
// ВАЖНО: Используем exports, а не module.exports
try {
    exports = plugin;
    console.log('✅ Plugin exported via exports');
} catch(e) {
    console.log('⚠️ Could not export via exports:', e.message);
}

// Также пробуем другие способы на всякий случай
try {
    if (typeof module !== 'undefined') {
        module.exports = plugin;
        console.log('✅ Plugin also exported via module.exports');
    }
} catch(e) {
    console.log('⚠️ module.exports error:', e.message);
}

console.log('🎨 IMAGE EDITOR: Plugin definition complete');
