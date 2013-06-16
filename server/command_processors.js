(function() {
  
  var exec = require('child_process').exec,
      trim = function(s) {
        return s.replace(/^\s+|\s+$/g, '');
      };
  
  var CommandProcessors = {
    add: function(mpd, args, callback) {
      if (!args.length) {
        return;
      }
      
      var url = args[0];
      
      if (/^https?:\/\/.*?youtube.com\/watch/.test(url)) {
        exec('youtube-dl -g ' + url, function(error, stdout, stderr) {
          var streamUrl = trim(stdout);
          
          console.log('Retrieved stream url for: ', streamUrl);
          
          callback(streamUrl);
        });
      }
    }
  };

  if (this.define && define.amd) {
    // Publish as AMD module
    define(function() {
      return CommandProcessors;
    });
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = CommandProcessors;
  }
})();
