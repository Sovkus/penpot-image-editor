// plugin.js - минимальный рабочий плагин по документации Penpot
console.log('🔧 PENPOT PLUGIN: Loading...');

// Согласно документации Penpot, плагин должен быть доступен как глобальный объект
// с методом create()

// Определяем плагин
PenpotPlugin = {
    create: function() {
        console.log('🔧 PENPOT PLUGIN: create() method called!');
        
        // Возвращаем объект с интерфейсом плагина
        return {
            // HTML содержимое
            html: `
                <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    <h3 style="color: var(--penpot-text-primary); margin-bottom: 10px;">🎨 Image Editor</h3>
                    <p style="color: var(--penpot-text-secondary);">Plugin is successfully loaded!</p>
                    <p style="color: var(--penpot-text-secondary); font-size: 12px; margin-top: 20px;">
                        Select an image in Penpot to start editing.
                    </p>
                </div>
            `,
            
            // CSS стили
            css: `
                div {
                    background: var(--penpot-background-secondary);
                    border-radius: 8px;
                    height: 100%;
                }
            `,
            
            // Вызывается когда плагин монтируется в DOM
            onMount: function(root) {
                console.log('🔧 PENPOT PLUGIN: onMount() called!');
                console.log('Root element:', root);
                
                // Можно добавить интерактивности
                setTimeout(function() {
                    var p = document.createElement('p');
                    p.textContent = '✅ Plugin mounted at: ' + new Date().toLocaleTimeString();
                    p.style.color = 'var(--penpot-text-secondary)';
                    p.style.fontSize = '11px';
                    p.style.marginTop = '10px';
                    root.querySelector('div').appendChild(p);
                }, 1000);
            },
            
            // Вызывается при получении сообщений от Penpot
            onMessage: function(data) {
                console.log('🔧 PENPOT PLUGIN: Received message:', data);
            }
        };
    }
};

console.log('🔧 PENPOT PLUGIN: Plugin object created:', PenpotPlugin);
console.log('🔧 PENPOT PLUGIN: Has create method?', typeof PenpotPlugin.create === 'function');

// Для отладки - сразу вызываем create
try {
    console.log('🔧 PENPOT PLUGIN: Testing create()...');
    var testResult = PenpotPlugin.create();
    console.log('🔧 PENPOT PLUGIN: create() returned:', testResult);
} catch(e) {
    console.error('🔧 PENPOT PLUGIN: Error calling create():', e);
}

console.log('🔧 PENPOT PLUGIN: Script execution complete');
