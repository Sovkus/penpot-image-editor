// plugin.js
console.log('🛠️ IMAGE EDITOR: Loading with CommonJS export...');

// Создаем объект плагина
var pluginObject = {
    create: function() {
        console.log('✅ IMAGE EDITOR: create() FINALLY CALLED!');
        
        return {
            html: `
                <div style="padding:20px;color:var(--penpot-text-primary)">
                    <h3>🎨 Image Editor</h3>
                    <p>Plugin is working!</p>
                    <p style="font-size:12px;color:var(--penpot-text-secondary)">
                        Select an image to edit
                    </p>
                </div>
            `,
            css: 'div { background: var(--penpot-background-secondary); border-radius:8px; height:100%; }',
            onMount: function(root) {
                console.log('✅ IMAGE EDITOR: onMount() - Plugin is mounted!', root);
            },
            onMessage: function(data) {
                console.log('✅ IMAGE EDITOR: Message:', data);
            }
        };
    }
};

// Пробуем разные способы экспорта
console.log('🛠️ Trying different export methods...');

// Способ 1: CommonJS (самый вероятный для Penpot)
try {
    if (typeof module !== 'undefined') {
        // Важно! Не module.exports, а просто присвоить exports
        exports = pluginObject;
        console.log('✅ Exported via exports =');
    }
} catch(e) {
    console.log('❌ exports error:', e.message);
}

// Способ 2: Присвоить глобальной переменной exports
try {
    this.exports = pluginObject;
    console.log('✅ Exported via this.exports =');
} catch(e) {
    console.log('❌ this.exports error:', e.message);
}

// Способ 3: Создать глобальную переменную Plugin (как было)
var Plugin = pluginObject;
console.log('✅ Also available as var Plugin');

// Способ 4: Использовать eval контекст
try {
    (0, eval)('var Plugin = ' + JSON.stringify(pluginObject));
    console.log('✅ Exported via eval');
} catch(e) {
    console.log('❌ eval error:', e.message);
}

console.log('🛠️ IMAGE EDITOR: Plugin ready');
