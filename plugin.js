// ultra-simple.js
console.log('ULTRA SIMPLE PLUGIN LOADED');

// Просто определяем глобальную переменную
Plugin = {
    create: function() {
        console.log('ULTRA SIMPLE: create() called');
        return {
            html: '<div>TEST</div>',
            css: '',
            onMount: function() { console.log('ULTRA SIMPLE: mounted'); },
            onMessage: function() {}
        };
    }
};

console.log('Plugin defined:', Plugin);
