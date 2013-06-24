(function() {
  var BasicMode = require('./basic_mode.js'),
      _ = require('underscore');
  
  var MasterMode = BasicMode.extend({
    init: function(mpd, cmdProcessors) {
      this._super(mpd, cmdProcessors);
      
      this.type = 'master';
      
      this.master = null;
    },
    
    connected: function(client) {
      this.clientsManager.connected(client);
            
      if (!this.master && !this.clientsManager.isEmpty()) {
        this.setMaster(this.clientsManager.first());
      }
      
      client.emit('connected', {
        id: client.userid,
        clients: this.clientsManager.clientIds(),
        mode: this.type,
        master: this.master
      });
    },
    
    disconnected: function(client) {
      this._super(client);
      
      if (this.clientsManager.isEmpty()) {
        this.clearMaster();
      } else if (!this.isMaster(this.clientsManager.first())) {
        this.setMaster(this.clientsMaster.first());
      }
    },
    
    rotate: function() {
      if (this.clients.isEmpty()) {
        return;
      }
      
      this.clientsManager.rotate();
      
      this.setMaster(this.clientsManager.first());
    },
    
    canExecute: function(command, client) {
      return this.isMaster(client) || isWhitelistCommand(command);
    },
    
    isMaster: function(client) {
      return this.master === client.userid;
    },
    
    setMaster: function(client) {
      console.log('master changed');
      
      if (!client) {
        this.master = null;
        return;
      }
      
      this.master = client.userid;

      client.emit('master', this.master.userid);
      client.broadcast.emit('master', this.master.userid);
    },
    clearMaster: function() {
      this.setMaster(null);
    },
    
    isWhitelistCommand: function(cmd) {
      return (this.commandWhitelist.indexOf(cmd.command) !== -1);
    },
    
    commandWhitelist: ['currentsong', 'status', 'playlistinfo', 'list']
    
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
