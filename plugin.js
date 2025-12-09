// plugin.js
console.log('⚡ IMAGE EDITOR: Immediate test');

// Попробуем сразу выполнить код, который должен создавать интерфейс
(function() {
    console.log('⚡ IIFE executing...');
    
    // Попробуем получить доступ к Penpot API
    if (typeof window !== 'undefined' && window.parent) {
        console.log('⚡ Window parent exists');
        
        // Отправим сообщение о готовности
        window.parent.postMessage({
            type: 'penpot-plugin-ready',
            name: 'image-editor'
        }, '*');
    }
    
    // Создадим глобальный объект разными способами
    var myPlugin = {
        create: function() {
            console.log('⚡ CREATE CALLED!');
            return {
                html: '<div>TEST</div>',
                css: '',
                onMount: function() { console.log('⚡ MOUNTED'); },
                onMessage: function() {}
            };
        }
    };
    
    // Пробуем все возможные способы
    try { exports = myPlugin; } catch(e) {}
    try { module.exports = myPlugin; } catch(e) {}
    try { this.exports = myPlugin; } catch(e) {}
    try { if (typeof window !== 'undefined') window.Plugin = myPlugin; } catch(e) {}
    try { Plugin = myPlugin; } catch(e) {}
    
    console.log('⚡ All exports attempted');
})();
