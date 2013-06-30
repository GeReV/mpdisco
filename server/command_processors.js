(function() {
  
  var exec = require('child_process').exec;
  
  var CommandProcessors = {
    add: function(mpd, args, callback, error) {
      if (!args.length) {
        return;
      }
      
      var url = args[0];
      
      if (/^https?:\/\/.*?youtube.com\/watch/.test(url)) {
        exec('youtube-dl -g ' + url, function(error, stdout, stderr) {
          if (!!error) {
            error();
            
            return;
          }
          
          var streamUrl = stdout.trim();
          
          console.log('Retrieved stream url for: ', url);
          
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
