(function() {
  var AbstractParser = require('./abstract_parser.js'),
      _ = require('underscore');
  
  var SimpleParser = AbstractParser.extend({
    parse: function(s) {
      if (!s) {
        return s;
      }
      
      var that = this,
          lines = s.split('\n'),
          obj = {},
          json = [],
          overwrites = 0;
  
      _(lines).chain().compact().each(function(l, index) {
        var o = that.parseLine(l);
        
        if (obj.hasOwnProperty(o.key) && overwrites >= 2) {
          console.warn('Key overwrite when parsing response (key=' + o.key + '), SimpleParser could be wrong for response. Response:');
          console.warn(s);
        }
        
        obj[o.key] = o.value;
      });
      
      json.push(obj);
      
      return (json.length == 1 ? json[0] : json);
    }
  });
  
  module.exports = SimpleParser;
  
})();
