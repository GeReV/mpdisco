(function() {
  
  var MasterMode = function(mpd, clients) {
    this.type = 'master';
    
    this.mpd = mpd;
    this.clients = clients;
    
    this.master = null;
  };
  
  MasterMode.prototype.command = function(command, args, client) {
    if (this.isMaster(client) || true) {
      console.log('Received command', command, 'from', client.userid);
      
      this.mpd.command(command, args, function(err, result) {
        client.emit(command, result);
      });
      
      return;
    }
    
    client.emit('update', {
      type: 'nopermission'
    });
  };
  
  MasterMode.prototype.isMaster = function(client) {
    return this.master === client;
  };
  
  MasterMode.prototype.setMaster = function(client) {
    
    this.master = client;
    
    this.master.broadcast.emit('update', {
      type: 'master',
      who: this.master.userid
    });
  };
  
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
