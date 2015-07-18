import dbg from 'debug';
import BasicMode from './basic_mode.js';
import ClientsManager from '../clients_manager.js';
import config from '../../../config.json';

const debug = dbg('mpdisco:master_mode');

var MasterMode = BasicMode.extend({
  init: function(mpd) {
    this._super(mpd);

    this.type = 'master';

    this.master = null;

    var clientsManager = this.clientsManager = ClientsManager.instance();

    clientsManager.on('disconnected', this.disconnected.bind(this));

    clientsManager.on('connected', this.connected.bind(this));

    clientsManager.on('identified', this.identified.bind(this));
  },

  connected: function(client) {
    client.emit('connected', {
      userid: client.info.userid,
      info: client.info,
      clients: this.clientsManager.clientsInfo(),
      mode: this.type,
      master: this.master
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
    if (!client) {
      this.master = null;

      debug('Master cleared.');

      return;
    }

    this.master = client.info.userid;

    debug('Master changed: %s', this.master);

    this.setMasterTimeout();

    client.emit('master', this.master);
    client.broadcast.emit('master', this.master);
  },
  clearMaster: function() {
    this.setMaster(null);
  },
  setMasterTimeout: function() {

    var masterTime = +config.master_time;

    clearTimeout(this.masterTimeout);

    debug('Master timeout: %s min', masterTime);

    this.masterTimestamp = Date.now();

    this.masterTimeout = setTimeout(function() {
      debug('Rotating master');

      this.clientsManager.rotate();

      this.setMaster(this.clientsManager.first());

    }.bind(this), masterTime * 60 * 1000);
  },

  isWhitelistCommand: function(cmd) {
    return (this.commandWhitelist.indexOf(cmd) !== -1);
  },

  commandWhitelist: ['currentsong', 'status', 'playlistinfo', 'list', 'find', 'update']

});

MasterMode.create = function(mpd) {
  return new MasterMode(mpd);
};

module.exports = MasterMode;
