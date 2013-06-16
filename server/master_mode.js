(function() {
  var BasicMode = require('./basic_mode.js');
  
  var MasterMode = BasicMode.extend({
    init: function(mpd, clients, cmdProcessors) {
      this._super(mpd, clients, cmdProcessors);
      
      this.type = 'master';
      
      this.master = null;
    },
    
    canExecute: function(command, client) {
      return this.isMaster(client) || true;
    },
    
    isMaster: function(client) {
    return this.master === client;
    },
    setMaster: function(client) {
    
      this.master = client;
      
      this.master.broadcast.emit('update', {
        type: 'master',
        who: this.master.userid
      });
    }
    
  });
  
  if (this.define && define.amd) {
    // Publish as AMD module
    define(function() {
      return MasterMode;
    });
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = MasterMode;
  }
})();
