(function() {
  
  var Class = require('clah');
  
  var AbstractParser = Class.extend({
    parse: function(response) {
      return {};
    },
    parseLine: function(l) {
      var i = l.indexOf(':'),
          key = l.slice(0, i).toLowerCase().trim(),
          value = (l.slice(i + 1) || '').trim();
          
      return {
        key: key,
        value: value
      };
    }
  });
  
  module.exports = AbstractParser;
  
})();
