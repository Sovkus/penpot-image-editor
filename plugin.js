// plugin.js - РАБОЧИЙ ВАРИАНТ
console.log('🎨 IMAGE EDITOR PLUGIN: Loading...');

// ВАЖНО: Нужно использовать var/let/const, а не просто присваивать
// Penpot вероятно использует strict mode

// Объявляем глобальную переменную через var
var Plugin = {
    create: function() {
        console.log('🎨 IMAGE EDITOR: create() called!');
        
        return {
            // HTML интерфейс плагина
            html: `
                <div class="image-editor-container">
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
                        Select an image in Penpot to begin editing
                    </div>
                </div>
            `,
            
            // CSS стили
            css: `
                .image-editor-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: transparent;
                    color: var(--penpot-text-primary);
                    padding: 16px;
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
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid var(--penpot-border-primary);
                    background: var(--penpot-background-secondary);
                    color: var(--penpot-text-primary);
                    cursor: pointer;
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
            
            // Вызывается при монтировании плагина
            onMount: function(root) {
                console.log('🎨 IMAGE EDITOR: onMount() called!', root);
                
                // Здесь будет инициализация логики плагина
                // Пока просто покажем, что плагин работает
                setTimeout(function() {
                    var infoText = root.querySelector('#info-text');
                    if (infoText) {
                        infoText.textContent = 'Plugin initialized! Select an image.';
                        infoText.style.color = 'var(--penpot-success)';
                    }
                }, 1000);
            },
            
            // Обработка сообщений от Penpot
            onMessage: function(data) {
                console.log('🎨 IMAGE EDITOR: onMessage()', data);
            }
        };
    }
};

console.log('🎨 IMAGE EDITOR: Plugin object created successfully!');
console.log('🎨 IMAGE EDITOR: Plugin.create is a function?', typeof Plugin.create === 'function');
