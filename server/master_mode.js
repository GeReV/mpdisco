(function() {
  var BasicMode = require('./basic_mode.js'),
      _ = require('underscore');
  
  var MasterMode = BasicMode.extend({
    init: function(mpd, clients, cmdProcessors) {
      this._super(mpd, clients, cmdProcessors);
      
      this.type = 'master';
      
      this.master = null;
    },
    
    connected: function(client) {
      this.clients.push(client);
      
      if (!this.master && this.clients.length) {
        this.setMaster(this.clients[0]);
      }
      
      client.emit('connected', {
        id: client.userid,
        clients: _.map(this.clients, function(v) { return v.userid; }),
        mode: this.type,
        master: this.master && this.master.userid
      });
    },
    
    disconnected: function(client) {
      this.clients = this.clients.splice(this.clients.indexOf(client), 1);
      
      if (!this.clients.length) {
        this.setMaster(null);
      } else if (this.clients[0] !== this.master) {
        this.setMaster(this.clients[0]);
      }
    },
    
    canExecute: function(command, client) {
      return this.isMaster(client) || isWhitelistCommand(command);
    },
    
    isMaster: function(client) {
      return this.master === client;
    },
    
    setMaster: function(client) {
      
      console.log('master changed');
    
      this.master = client;
      
      if (this.master) {
        this.master.emit('master', this.master.userid);
        this.master.broadcast.emit('master', this.master.userid);
      }
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
