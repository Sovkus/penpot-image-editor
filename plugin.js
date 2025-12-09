// Минимальный рабочий плагин для Penpot
window.PenpotPlugin = {
    create: function() {
        console.log('Image Editor: create() called');
        
        return {
            html: '<div style="padding: 20px; color: var(--penpot-text-primary);">Image Editor Plugin - Working!</div>',
            css: '',
            onMount: function(root) {
                console.log('Plugin mounted!', root);
            },
            onMessage: function(data) {
                console.log('Message:', data);
            }
        };
    }
};
