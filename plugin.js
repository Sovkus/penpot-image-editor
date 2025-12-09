(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.PenpotPlugin = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return {
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
}));
