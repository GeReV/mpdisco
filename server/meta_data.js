(function() {
  var fs = require('fs'),
      mm = require('musicmetadata');
  
  var MetaData = {
    forFile: function(path, callback) {
      var stream = fs.createReadStream(path),
          parser = new mm(stream);
      
      parser.once('metadata', function(data) {
        stream.destroy();
        
        callback(data);
      });
    },
    safeName: function(s) {
      if (!s) {
        return s;
      }
      
      return s.replace(/[^\w\-,\. ]+/g, '').replace(/[, ]+/g, '_');
    }
  };
  
  module.exports = MetaData;
})();
