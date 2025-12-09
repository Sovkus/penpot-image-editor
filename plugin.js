class ImageEditorPlugin {
    constructor() {
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas = document.getElementById('preview-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewPlaceholder = document.getElementById('preview-placeholder');
        
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
        this.setupPenpotCommunication();
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

    setupPenpotCommunication() {
        // Listen for messages from Penpot
        window.addEventListener('message', async (event) => {
            const data = event.data;
            
            if (data.type === 'selection-change') {
                await this.handleSelectionChange(data.selection);
            }
        });

        // Request initial selection
        this.sendMessage({ type: 'request-selection' });
    }

    sendMessage(message) {
        if (window.parent) {
            window.parent.postMessage(message, '*');
        }
    }

    async handleSelectionChange(selection) {
        if (!selection || selection.length === 0) {
            this.clearPreview();
            return;
        }

        // Get the first selected object
        const selectedObject = selection[0];
        
        // Check if it's an image
        if (selectedObject.type === 'image' && selectedObject.metadata) {
            await this.loadImage(selectedObject);
        } else {
            this.clearPreview();
        }
    }

    async loadImage(object) {
        try {
            // Request image data from Penpot
            this.sendMessage({
                type: 'request-image',
                id: object.id
            });
        } catch (error) {
            console.error('Error loading image:', error);
            this.clearPreview();
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
            data[i] = this.clamp(data[i] * factor);     // R
            data[i + 1] = this.clamp(data[i + 1] * factor); // G
            data[i + 2] = this.clamp(data[i + 2] * factor); // B
        }
    }

    applyContrast(data) {
        if (this.settings.contrast === 0) return;
        
        const factor = (259 * (this.settings.contrast + 255)) / (255 * (259 - this.settings.contrast));
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = this.clamp(factor * (data[i] - 128) + 128);     // R
            data[i + 1] = this.clamp(factor * (data[i + 1] - 128) + 128); // G
            data[i + 2] = this.clamp(factor * (data[i + 2] - 128) + 128); // B
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
            
            data[i] = this.clamp(gray + factor * (r - gray));     // R
            data[i + 1] = this.clamp(gray + factor * (g - gray)); // G
            data[i + 2] = this.clamp(gray + factor * (b - gray)); // B
        }
    }

    applyTemperatureTint(data) {
        if (this.settings.temperature === 0 && this.settings.tint === 0) return;
        
        const temp = this.settings.temperature / 100;
        const tint = this.settings.tint / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // Temperature (warmer/cooler)
            data[i] = this.clamp(data[i] * (1 + temp)); // R
            data[i + 2] = this.clamp(data[i + 2] * (1 - temp)); // B
            
            // Tint (green/magenta)
            data[i + 1] = this.clamp(data[i + 1] * (1 - tint)); // G
            data[i] = this.clamp(data[i] * (1 + tint)); // R
        }
    }

    applyHighlightsShadows(data) {
        if (this.settings.highlights === 0 && this.settings.shadows === 0) return;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const brightness = (r + g + b) / 3;
            
            // Highlights
            if (brightness > 128 && this.settings.highlights !== 0) {
                const factor = 1 + (this.settings.highlights / 100);
                data[i] = this.clamp(r * factor);
                data[i + 1] = this.clamp(g * factor);
                data[i + 2] = this.clamp(b * factor);
            }
            
            // Shadows
            if (brightness < 128 && this.settings.shadows !== 0) {
                const factor = 1 + (this.settings.shadows / 100);
                data[i] = this.clamp(r * factor);
                data[i + 1] = this.clamp(g * factor);
                data[i + 2] = this.clamp(b * factor);
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
    }

    applyToImage() {
        if (!this.currentImage) {
            alert('Please select an image first');
            return;
        }

        // Send the adjusted settings back to Penpot
        this.sendMessage({
            type: 'apply-filters',
            settings: this.settings
        });
    }
}

// Initialize plugin when page loads
window.addEventListener('DOMContentLoaded', () => {
    new ImageEditorPlugin();
});