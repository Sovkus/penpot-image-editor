// Простейший плагин для Penpot - только вывод в консоль
console.log('=== PENPOT PLUGIN: simple.js загружен ===');
console.log('URL:', window.location.href);
console.log('User agent:', navigator.userAgent);

// Пробуем разные способы экспорта

// Способ 1: Создаем объект плагина
var myPlugin = {
    create: function() {
        console.log('=== PENPOT PLUGIN: create() вызван ===');
        console.log('this:', this);
        console.log('arguments:', arguments);
        
        return {
            html: '<div style="padding: 20px;">Test Plugin Loaded - Check Console</div>',
            css: '',
            onMount: function(root) {
                console.log('=== PENPOT PLUGIN: onMount() вызван ===');
                console.log('root element:', root);
                console.log('root HTML:', root.innerHTML);
            },
            onMessage: function(data) {
                console.log('=== PENPOT PLUGIN: onMessage() вызван ===');
                console.log('data:', data);
            }
        };
    }
};

console.log('=== PENPOT PLUGIN: Объект плагина создан ===');
console.log('myPlugin:', myPlugin);
console.log('myPlugin.create:', typeof myPlugin.create);

// Пробуем разные способы сделать плагин доступным
try {
    // Способ 1: Глобальная переменная
    if (typeof window !== 'undefined') {
        window.PenpotPlugin = myPlugin;
        console.log('=== PENPOT PLUGIN: Экспортирован как window.PenpotPlugin ===');
    }
} catch(e) {
    console.error('Ошибка при экспорте в window:', e);
}

try {
    // Способ 2: module.exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = myPlugin;
        console.log('=== PENPOT PLUGIN: Экспортирован как module.exports ===');
    }
} catch(e) {
    console.error('Ошибка при экспорте через module.exports:', e);
}

try {
    // Способ 3: Просто присваиваем глобальной переменной
    PenpotPlugin = myPlugin;
    console.log('=== PENPOT PLUGIN: Экспортирован как глобальная PenpotPlugin ===');
} catch(e) {
    console.error('Ошибка при экспорте как глобальная переменная:', e);
}

// Дополнительная проверка - вызовем create сразу
try {
    console.log('=== PENPOT PLUGIN: Пытаемся вызвать create() сейчас ===');
    var result = myPlugin.create();
    console.log('Результат create():', result);
    console.log('Тип результата:', typeof result);
    if (result) {
        console.log('Есть html:', typeof result.html);
        console.log('Есть css:', typeof result.css);
        console.log('Есть onMount:', typeof result.onMount);
        console.log('Есть onMessage:', typeof result.onMessage);
    }
} catch(e) {
    console.error('Ошибка при вызове create():', e);
}

console.log('=== PENPOT PLUGIN: Завершение загрузки скрипта ===');

// Сохраняем ссылку для отладки
if (typeof window !== 'undefined') {
    window._myDebugPlugin = myPlugin;
    console.log('=== PENPOT PLUGIN: Доступен как window._myDebugPlugin ===');
}
