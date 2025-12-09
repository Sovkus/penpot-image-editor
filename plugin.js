// Проверяем, есть ли module и exports, если нет, то создаем их
if (typeof module === 'undefined') {
  var module = { exports: {} };
}

if (typeof exports === 'undefined') {
  var exports = module.exports;
}

module.exports = {
  create: function() {
    console.log('Image Editor plugin: creating...');
    
    return {
      html: '<div style="padding: 20px;"><h1>Image Editor Test</h1><p>If you see this, plugin is working!</p></div>',
      css: 'div { color: var(--penpot-text-primary); }',
      onMount: function(root) {
        console.log('Plugin mounted!', root);
      },
      onMessage: function(data) {
        console.log('Message received:', data);
      }
    };
  }
};
