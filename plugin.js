class ImageEditorPlugin {
    constructor() {
        this.penpot = new PenpotAPI();
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas = document.getElementById('preview-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewPlaceholder = document.getElementById('preview-placeholder');
        this.selectedObject = null;
        
        this.settings = {
            exposure: 0,
            contrast: 0,
            saturation: 0,
            temperature: 0,
            tint: 0,
            highlights: 0,
            shadows: 0
        };

        this.initializeEventListeners();
        this.setupSelectionPolling();
    }

    initializeEventListeners() {
        // Slider events
        const sliders = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(`${sliderId}-value`);
            
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.settings[sliderId] = value;
                valueDisplay.textContent = value;
                this.applyFilters();
            });
        });

        // Button events
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSettings());
        document.getElementById('apply-btn').addEventListener('click', () => this.applyToImage());
    }

    async setupSelectionPolling() {
        // Периодически проверяем выделение
        setInterval(async () => {
            try {
                const response = await this.penpot.getSelection();
                await this.handleSelectionUpdate(response);
            } catch (error) {
                console.log('Selection check:', error);
            }
        }, 1000);

        // Первоначальная проверка
        try {
            const response = await this.penpot.getSelection();
            await this.handleSelectionUpdate(response);
        } catch (error) {
            console.log('Initial selection:', error);
        }
    }

    async handleSelectionUpdate(response) {
        if (!response || !response.selection || response.selection.length === 0) {
            if (this.selectedObject) {
                this.clearPreview();
                this.selectedObject = null;
            }
            return;
        }

        // Получаем первый выделенный объект
        const selection = response.selection[0];
        
        // Если это изображение и оно изменилось
        if (selection.type === 'image' && 
            (!this.selectedObject || this.selectedObject.id !== selection.id)) {
            
            this.selectedObject = selection;
            await this.loadImage(selection);
        }
    }

    async loadImage(object) {
        try {
            this.showMessage('Loading image...');
            
            // Получаем данные изображения
            const response = await this.penpot.getImageData(object.id);
            
            if (response && response.imageData) {
                await this.setImageFromData(response.imageData);
                this.showMessage('');
            } else {
                this.showMessage('Failed to load image');
                this.clearPreview();
            }
        } catch (error) {
            console.error('Error loading image:', error);
            this.showMessage('Error loading image');
            this.clearPreview();
        }
    }

    showMessage(message) {
        const infoText = document.querySelector('.info-text');
        if (infoText) {
            infoText.textContent = message;
        }
    }

    async setImageFromData(imageData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.currentImage = img;
                this.canvas.width = 208;
                this.canvas.height = 208;
                
                // Calculate dimensions to fit in 208x208 while maintaining aspect ratio
                const scale = Math.min(
                    208 / img.width,
                    208 / img.height
                );
                
                const width = img.width * scale;
                const height = img.height * scale;
                const x = (208 - width) / 2;
                const y = (208 - height) / 2;
                
                this.ctx.clearRect(0, 0, 208, 208);
                this.ctx.drawImage(img, x, y, width, height);
                
                // Store original image data for reset
                this.originalImageData = this.ctx.getImageData(0, 0, 208, 208);
                
                this.previewPlaceholder.style.display = 'none';
                this.canvas.style.display = 'block';
                
                resolve();
            };
            
            img.onerror = reject;
            img.src = imageData;
        });
    }

    clearPreview() {
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas.style.display = 'none';
        this.previewPlaceholder.style.display = 'flex';
        this.showMessage('Select an image in Penpot to edit');
    }

    applyFilters() {
        if (!this.originalImageData) return;

        // Restore original image
        this.ctx.putImageData(this.originalImageData, 0, 0);
        
        // Get current image data
        const imageData = this.ctx.getImageData(0, 0, 208, 208);
        const data = imageData.data;

        // Apply all filters
        this.applyExposure(data);
        this.applyContrast(data);
        this.applySaturation(data);
        this.applyTemperatureTint(data);
        this.applyHighlightsShadows(data);

        // Put modified data back
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
            // Temperature adjustment
            if (this.settings.temperature !== 0) {
                data[i] = this.clamp(data[i] * (1 + temp));
                data[i + 2] = this.clamp(data[i + 2] * (1 - temp));
            }
            
            // Tint adjustment
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
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const brightness = (r + g + b) / 3;
            
            if (brightness > 150 && this.settings.highlights !== 0) {
                data[i] = this.clamp(r * highlightsFactor);
                data[i + 1] = this.clamp(g * highlightsFactor);
                data[i + 2] = this.clamp(b * highlightsFactor);
            } else if (brightness < 100 && this.settings.shadows !== 0) {
                data[i] = this.clamp(r * shadowsFactor);
                data[i + 1] = this.clamp(g * shadowsFactor);
                data[i + 2] = this.clamp(b * shadowsFactor);
            }
        }
    }

    clamp(value) {
        return Math.max(0, Math.min(255, Math.round(value)));
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

        // Reset sliders and displays
        Object.keys(this.settings).forEach(key => {
            const slider = document.getElementById(key);
            const valueDisplay = document.getElementById(`${key}-value`);
            
            if (slider) slider.value = 0;
            if (valueDisplay) valueDisplay.textContent = '0';
        });

        // Restore original image
        if (this.originalImageData) {
            this.ctx.putImageData(this.originalImageData, 0, 0);
        }
        
        this.showMessage('Settings reset');
    }

    async applyToImage() {
        if (!this.selectedObject) {
            this.showMessage('Please select an image first');
            return;
        }

        if (!this.currentImage) {
            this.showMessage('No image loaded');
            return;
        }

        try {
            this.showMessage('Applying filters...');
            
            // Отправляем настройки в Penpot
            await this.penpot.applyFilters({
                ...this.settings,
                objectId: this.selectedObject.id
            });
            
            this.showMessage('Filters applied successfully!');
            
            // Через 2 секунды убираем сообщение
            setTimeout(() => {
                if (this.selectedObject) {
                    this.showMessage('');
                }
            }, 2000);
            
        } catch (error) {
            console.error('Error applying filters:', error);
            this.showMessage('Error applying filters');
        }
    }
}

// Инициализация плагина
window.addEventListener('DOMContentLoaded', () => {
    new ImageEditorPlugin();
});
