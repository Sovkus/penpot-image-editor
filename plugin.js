// plugin.js
console.log('!!! PENPOT PLUGIN LOADED !!!');

// ВАЖНО: Penpot может искать плагин по имени "Plugin" или "PenpotPlugin"
// Пробуем оба варианта

// Вариант A
var Plugin = {
    create: function() {
        console.log('!!! Plugin.create() CALLED !!!');
        return {
            html: '<div style="padding: 20px;"><h3>Image Editor</h3><p>Plugin is working!</p></div>',
            css: '',
            onMount: function(root) {
                console.log('!!! Plugin mounted !!!', root);
            },
            onMessage: function(data) {
                console.log('!!! Message received !!!', data);
            }
        };
    }
};

// Вариант B
var PenpotPlugin = Plugin; // Тот же объект

console.log('Plugin object:', Plugin);
console.log('PenpotPlugin object:', PenpotPlugin);

// Попробуем сделать доступным разными способами
try {
    // Способ 1: Присвоить глобальной переменной
    this.Plugin = Plugin;
    console.log('Assigned to this.Plugin');
} catch(e) {
    console.log('Cannot assign to this:', e);
}

try {
    // Способ 2: Через window если доступен
    if (typeof window !== 'undefined') {
        window.Plugin = Plugin;
        window.PenpotPlugin = PenpotPlugin;
        console.log('Assigned to window.Plugin and window.PenpotPlugin');
    }
} catch(e) {
    console.log('Window not available:', e);
}

// Для отладки
console.log('typeof Plugin:', typeof Plugin);
console.log('typeof Plugin.create:', typeof Plugin.create);
