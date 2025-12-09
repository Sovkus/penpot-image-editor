// plugin.js
console.log('=== PENPOT PLUGIN START ===');

// Создаем плагин
var plugin = {
    create: function() {
        console.log('=== CREATE CALLED ===');
        
        return {
            html: '<div style="padding: 20px; color: var(--penpot-text-primary);">Image Editor Plugin is working!</div>',
            css: 'div { background: var(--penpot-background-secondary); border-radius: 8px; }',
            onMount: function(root) {
                console.log('=== ONMOUNT CALLED ===');
                console.log('Root element:', root);
                
                // Добавляем немного интерактивности
                var div = root.querySelector('div');
                if (div) {
                    div.innerHTML += '<p><button id="test-btn">Click Me!</button></p>';
                    root.querySelector('#test-btn').addEventListener('click', function() {
                        div.innerHTML += '<p>Button clicked at ' + new Date().toLocaleTimeString() + '</p>';
                    });
                }
            },
            onMessage: function(data) {
                console.log('=== ONMESSAGE ===', data);
            }
        };
    }
};

console.log('Plugin object created:', plugin);

// Экспортируем ЧЕРЕЗ module.exports
try {
    module.exports = plugin;
    console.log('=== EXPORTED via module.exports ===');
} catch(e) {
    console.error('Error exporting via module.exports:', e);
}

// Также пробуем сделать доступным глобально
try {
    if (typeof window !== 'undefined') {
        window.__penpotPlugin = plugin;
        console.log('=== Also available as window.__penpotPlugin ===');
    }
} catch(e) {
    console.log('Window not available');
}

console.log('=== PENPOT PLUGIN END ===');
