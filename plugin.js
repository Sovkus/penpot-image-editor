// Image Editor Plugin for Penpot
// Экспортируем функцию, которая создает плагин

module.exports = {
  create: function() {
    console.log('Image Editor plugin: create() called');
    
    return {
      // HTML содержимое плагина
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
      `,
      
      // CSS стили
      css: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: transparent;
          color: var(--penpot-text-primary);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 100vh;
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
          border: none;
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
      `,
      
      // Функция, вызываемая когда плагин монтируется
      onMount: function(root) {
        console.log('Image Editor plugin: onMount() called', root);
        
        // Инициализируем плагин
        const plugin = new ImageEditorPlugin(root);
        plugin.init();
        
        // Сохраняем ссылку на плагин в root элементе
        root.__imageEditorPlugin = plugin;
      },
      
      // Функция для обработки сообщений от Penpot
      onMessage: function(data) {
        console.log('Image Editor plugin: onMessage() called', data);
      }
    };
  }
};

// Класс плагина
class ImageEditorPlugin {
  constructor(root) {
    this.root = root;
    this.canvas = null;
    this.ctx = null;
    this.previewPlaceholder = null;
    this.infoText = null;
    this.originalImageData = null;
    
    this.settings = {
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0
    };
  }
  
  init() {
    console.log('Initializing Image Editor plugin...');
    
    // Получаем элементы DOM
    this.canvas = this.root.querySelector('#preview-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.previewPlaceholder = this.root.querySelector('#preview-placeholder');
    this.infoText = this.root.querySelector('#info-text');
    
    // Инициализируем слайдеры
    this.initSliders();
    
    // Инициализируем кнопки
    this.initButtons();
    
    // Устанавливаем начальный статус
    this.updateStatus('Select an image in Penpot to edit');
    
    // Запрашиваем текущее выделение
    this.sendMessage({ type: 'get-selection' });
    
    // Начинаем опрос выделения
    this.startSelectionPolling();
    
    console.log('Image Editor plugin initialized');
  }
  
  initSliders() {
    const sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
    
    sliders.forEach(sliderId => {
      const slider = this.root.querySelector(`#${sliderId}`);
      const valueDisplay = this.root.querySelector(`#${sliderId}-value`);
      
      if (slider && valueDisplay) {
        slider.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.settings[sliderId] = value;
          valueDisplay.textContent = value;
          this.applyFilters();
        });
      }
    });
  }
  
  initButtons() {
    const resetBtn = this.root.querySelector('#reset-btn');
    const applyBtn = this.root.querySelector('#apply-btn');
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSettings());
    }
    
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyToImage());
    }
  }
  
  startSelectionPolling() {
    // Опрашиваем выделение каждую секунду
    setInterval(() => {
      this.sendMessage({ type: 'get-selection' });
    }, 1000);
  }
  
  sendMessage(message) {
    // Отправляем сообщение в Penpot через postMessage
    if (window.parent) {
      window.parent.postMessage({
        ...message,
        pluginId: 'image-editor',
        source: 'penpot-plugin'
      }, '*');
    }
  }
  
  updateStatus(message) {
    console.log('Status:', message);
    if (this.infoText) {
      this.infoText.textContent = message;
    }
  }
  
  loadImage(imageUrl) {
    const img = new Image();
    
    img.onload = () => {
      // Настраиваем canvas
      this.canvas.width = 208;
      this.canvas.height = 208;
      
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
      this.ctx.clearRect(0, 0, 208, 208);
      this.ctx.drawImage(img, x, y, width, height);
      
      // Сохраняем оригинальные данные
      this.originalImageData = this.ctx.getImageData(0, 0, 208, 208);
      
      // Показываем canvas
      this.canvas.style.display = 'block';
      this.previewPlaceholder.style.display = 'none';
      
      this.updateStatus('Image loaded. Adjust settings.');
      
      // Сбрасываем настройки
      this.resetSettings();
    };
    
    img.onerror = () => {
      this.updateStatus('Error loading image');
      this.clearPreview();
    };
    
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  }
  
  clearPreview() {
    this.canvas.style.display = 'none';
    this.previewPlaceholder.style.display = 'flex';
    this.originalImageData = null;
  }
  
  applyFilters() {
    if (!this.originalImageData) return;
    
    // Восстанавливаем оригинал
    this.ctx.putImageData(this.originalImageData, 0, 0);
    
    // Получаем данные для обработки
    const imageData = this.ctx.getImageData(0, 0, 208, 208);
    const data = imageData.data;
    
    // Применяем фильтры
    this.applyExposure(data);
    this.applyContrast(data);
    this.applySaturation(data);
    this.applyTemperatureTint(data);
    this.applyHighlightsShadows(data);
    
    // Возвращаем обработанные данные
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  applyExposure(data) {
    if (this.settings.exposure === 0) return;
    
    const factor = 1 + (this.settings.exposure / 100);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.clamp(data[i] * factor);
      data[i + 1] = this.clamp(data[i + 1] * factor);
      data[i + 2] = this.clamp(data[i + 2] * factor);
    }
  }
  
  applyContrast(data) {
    if (this.settings.contrast === 0) return;
    
    const factor = (259 * (this.settings.contrast + 255)) / (255 * (259 - this.settings.contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.clamp(factor * (data[i] - 128) + 128);
      data[i + 1] = this.clamp(factor * (data[i + 1] - 128) + 128);
      data[i + 2] = this.clamp(factor * (data[i + 2] - 128) + 128);
    }
  }
  
  applySaturation(data) {
    if (this.settings.saturation === 0) return;
    
    const factor = 1 + (this.settings.saturation / 100);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      
      data[i] = this.clamp(gray + factor * (r - gray));
      data[i + 1] = this.clamp(gray + factor * (g - gray));
      data[i + 2] = this.clamp(gray + factor * (b - gray));
    }
  }
  
  applyTemperatureTint(data) {
    if (this.settings.temperature === 0 && this.settings.tint === 0) return;
    
    const temp = this.settings.temperature / 100;
    const tint = this.settings.tint / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      if (this.settings.temperature !== 0) {
        data[i] = this.clamp(data[i] * (1 + temp));
        data[i + 2] = this.clamp(data[i + 2] * (1 - temp));
      }
      
      if (this.settings.tint !== 0) {
        data[i] = this.clamp(data[i] * (1 + tint));
        data[i + 1] = this.clamp(data[i + 1] * (1 - tint));
      }
    }
  }
  
  applyHighlightsShadows(data) {
    if (this.settings.highlights === 0 && this.settings.shadows === 0) return;
    
    const highlightsFactor = 1 + (this.settings.highlights / 200);
    const shadowsFactor = 1 + (this.settings.shadows / 200);
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      if (brightness > 150 && this.settings.highlights !== 0) {
        data[i] = this.clamp(data[i] * highlightsFactor);
        data[i + 1] = this.clamp(data[i + 1] * highlightsFactor);
        data[i + 2] = this.clamp(data[i + 2] * highlightsFactor);
      } else if (brightness < 100 && this.settings.shadows !== 0) {
        data[i] = this.clamp(data[i] * shadowsFactor);
        data[i + 1] = this.clamp(data[i + 1] * shadowsFactor);
        data[i + 2] = this.clamp(data[i + 2] * shadowsFactor);
      }
    }
  }
  
  clamp(value) {
    return Math.max(0, Math.min(255, value));
  }
  
  resetSettings() {
    this.settings = {
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0
    };
    
    // Сбрасываем слайдеры
    const sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
    
    sliders.forEach(sliderId => {
      const slider = this.root.querySelector(`#${sliderId}`);
      const valueDisplay = this.root.querySelector(`#${sliderId}-value`);
      
      if (slider) slider.value = 0;
      if (valueDisplay) valueDisplay.textContent = '0';
    });
    
    // Восстанавливаем оригинальное изображение
    if (this.originalImageData) {
      this.ctx.putImageData(this.originalImageData, 0, 0);
    }
    
    this.updateStatus('Settings reset');
  }
  
  applyToImage() {
    if (!this.originalImageData) {
      this.updateStatus('No image loaded');
      return;
    }
    
    this.updateStatus('Applying filters...');
    
    // Отправляем настройки в Penpot
    this.sendMessage({
      type: 'apply-filters',
      settings: this.settings
    });
  }
}
