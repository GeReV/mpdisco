var BasicMode = require('./basic_mode.js'),
    ClientsManager = require('../clients_manager.js'),
    config = require('../../config.json'),
    _ = require('underscore');

var MasterMode = BasicMode.extend({
  init: function(mpd, cmdProcessors) {
    this._super(mpd, cmdProcessors);

    this.type = 'master';

    this.master = null;

    var clientsManager = this.clientsManager = ClientsManager.instance();

    clientsManager.on('disconnected', this.disconnected.bind(this));

    clientsManager.on('connected', this.connected.bind(this));

    clientsManager.on('identified', this.identified.bind(this));
  },

  connected: function(client) {
    client.emit('connected', {
      id: client.info.userid,
      info: client.info,
      clients: this.clientsManager.clientsInfo(),
      mode: this.type,
      master: this.master && this.clientsManager.get(this.master).info
    });
  },

  disconnected: function(client) {
    if (this.clientsManager.isEmpty()) {
      this.clearMaster();
    } else if (!this.isMaster(this.clientsManager.first())) {
      this.setMaster(this.clientsManager.first());
    }
  },

  identified: function(client) {
    if (!this.master && !this.clientsManager.isEmpty()) {
      this.setMaster(this.clientsManager.first());
    }
  },

  rotate: function() {
    if (this.clientsManager.isEmpty()) {
      return;
    }

    this.clientsManager.rotate();

    this.setMaster(this.clientsManager.first());
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

    this.masterTimestamp = (new Date()).getTime();

    this.masterTimeout = setTimeout(function() {
      console.log('rotating master');

      this.clientsManager.rotate();

      this.setMaster(this.clientsManager.first());

      clearTimeout(this.masterTimeout);
    }.bind(this), +config.master_time * 60 * 1000);

  },

  isWhitelistCommand: function(cmd) {
    return (this.commandWhitelist.indexOf(cmd) !== -1);
  },

  commandWhitelist: ['currentsong', 'status', 'playlistinfo', 'list', 'find', 'update']

});
  
module.exports = MasterMode;
