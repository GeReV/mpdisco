(function() {
  var BasicMode = require('./basic_mode.js'),
      ClientsManager = require('./clients_manager.js')(),
      config = require('../config.json'),
      _ = require('underscore');
  
  var MasterMode = BasicMode.extend({
    init: function(mpd, cmdProcessors) {
      this._super(mpd, cmdProcessors);
      
      this.type = 'master';
      
      this.master = null;
      
      ClientsManager.on('disconnected', this.disconnected.bind(this));
      
      ClientsManager.on('connected', this.connected.bind(this));
      
      ClientsManager.on('identified', this.identified.bind(this));
    },
    
    connected: function(client) {
      client.emit('connected', {
        id: client.info.userid,
        info: client.info,
        clients: ClientsManager.clientsInfo(),
        mode: this.type,
        master: this.master && ClientsManager.get(this.master).info
      });
    },
    
    disconnected: function(client) {
      if (ClientsManager.isEmpty()) {
        this.clearMaster();
      } else if (!this.isMaster(ClientsManager.first())) {
        this.setMaster(ClientsManager.first());
      }
    },
    
    identified: function(client) {
      if (!this.master && !ClientsManager.isEmpty()) {
        this.setMaster(ClientsManager.first());
      }
    },
    
    rotate: function() {
      if (Clients.isEmpty()) {
        return;
      }
      
      ClientsManager.rotate();
      
      this.setMaster(ClientsManager.first());
    },
    
    canExecute: function(command, client) {
      return this.isMaster(client) || this.isWhitelistCommand(command);
    },
    
    isMaster: function(client) {
      return this.master === client.info.userid;
    },
    
    setMaster: function(client) {
      var timeout;
      
      if (!client) {
        this.master = null;
        
        console.log('master cleared');
        
        return;
      }
      
      this.master = client.info.userid;
      
      console.log('master changed', this.master);
      
      this.setMasterTimeout();

      client.emit('master', ClientsManager.get(this.master).info);
      client.broadcast.emit('master', ClientsManager.get(this.master).info);
    },
    clearMaster: function() {
      this.setMaster(null);
    },
    setMasterTimeout: function() {

      clearTimeout(this.masterTimeout);
      
      console.log('master timeout (mins):', config.master_time);
      
      this.masterTimestamp = (new Date).getTime();
      
      this.masterTimeout = setTimeout(function() {
        console.log('rotating master');
        
        ClientsManager.rotate();
        
        this.setMaster(ClientsManager.first());
        
        clearTimeout(this.masterTimeout);
      }.bind(this), +config.master_time * 60 * 1000);
      
    },
    
    isWhitelistCommand: function(cmd) {
      return (this.commandWhitelist.indexOf(cmd) !== -1);
    },
    
    commandWhitelist: ['currentsong', 'status', 'playlistinfo', 'list', 'find', 'update']
    
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
