// Абсолютно минимальный плагин
console.log('!!! PENPOT PLUGIN LOADED !!!');

// Просто создаем объект - возможно Penpot сам его найдет
var PenpotPlugin = {
    create: function() {
        console.log('!!! CREATE CALLED !!!');
        return {
            html: '<div>Test</div>',
            css: '',
            onMount: function() { console.log('!!! ONMOUNT !!!'); },
            onMessage: function() { console.log('!!! ONMESSAGE !!!'); }
        };
    }
};
