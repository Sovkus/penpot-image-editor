// plugin.js
console.log('🔧 IMAGE EDITOR: Loading as function...');

// Пробуем экспортировать функцию, которая возвращает объект
module.exports = function() {
    console.log('🔧 IMAGE EDITOR: Module function called!');
    
    return {
        create: function() {
            console.log('🎉 IMAGE EDITOR: create() CALLED!');
            
            return {
                html: '<div style="padding:20px"><h3>Image Editor</h3><p>Success!</p></div>',
                css: '',
                onMount: function(root) {
                    console.log('🎉 IMAGE EDITOR: Mounted!', root);
                },
                onMessage: function(data) {
                    console.log('🎉 IMAGE EDITOR: Message:', data);
                }
            };
        }
    };
};

console.log('🔧 IMAGE EDITOR: Function exported');
