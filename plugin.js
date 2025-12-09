// plugin.js - отладочный плагин
console.log('🔍 DEBUG PLUGIN: Investigating Penpot plugin system');

// Давайте посмотрим, что доступно в контексте выполнения
console.log('🔍 Available globals:');
console.log('🔍 typeof module:', typeof module);
console.log('🔍 typeof exports:', typeof exports);
console.log('🔍 typeof require:', typeof require);
console.log('🔍 typeof window:', typeof window);
console.log('🔍 typeof document:', typeof document);
console.log('🔍 typeof this:', typeof this);
console.log('🔍 this keys:', Object.keys(this || {}));

// Пробуем перехватить, что Penpot ищет
var originalEval = eval;
try {
    eval = function(code) {
        console.log('🔍 eval called with:', code.substring(0, 100));
        return originalEval(code);
    };
} catch(e) {}

// Создаем объект-ловушку
var trap = {};
Object.defineProperty(this, 'Plugin', {
    set: function(value) {
        console.log('🔍 Penpot is setting Plugin to:', value);
        trap = value;
    },
    get: function() {
        console.log('🔍 Penpot is getting Plugin');
        return {
            create: function() {
                console.log('🔍 Penpot called Plugin.create()!');
                return {
                    html: '<div>TRAP SUCCESS</div>',
                    css: '',
                    onMount: function() { console.log('🔍 onMount in trap'); },
                    onMessage: function() {}
                };
            }
        };
    },
    configurable: true
});

console.log('🔍 DEBUG PLUGIN: Trap set up');
