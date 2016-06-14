import dbg from 'debug';
import BasicMode from './basic_mode.js';
import ClientsManager from '../clients_manager.js';
import config from '../../../config.json';

const debug = dbg('mpdisco:master_mode');

export default class MasterMode extends BasicMode {
  static commandWhitelist = [
    'currentsong',
    'status',
    'playlistinfo',
    'list',
    'find',
    'update'
  ];

  static create = mpd => {
    return new MasterMode(mpd);
  }

  constructor(mpd) {
    super(mpd);

    this.type = 'master';

    this.master = null;

    const clientsManager = this.clientsManager = ClientsManager.instance();

    clientsManager.on('disconnected', this.disconnected);

    clientsManager.on('connected', this.connected);

    clientsManager.on('identified', this.identified);
  }

  connected = client => {
    client.emit('connected', {
      userid: client.info.userid,
      info: client.info,
      clients: this.clientsManager.clientsInfo(),
      mode: this.type,
      master: this.master
    });
  };

  disconnected = client => {
    if (this.clientsManager.isEmpty()) {
      this.clearMaster();
    } else if (!this.isMaster(this.clientsManager.first())) {
      this.setMaster(this.clientsManager.first());
    }
  };

  identified = client => {
    if (!this.master && !this.clientsManager.isEmpty()) {
      this.setMaster(this.clientsManager.first());
    }
  };

  rotate = () => {
    if (this.clientsManager.isEmpty()) {
      return;
    }

    this.clientsManager.rotate();

    this.setMaster(this.clientsManager.first());
  };

  canExecute = (command, client) => {
    return this.isMaster(client) || this.isWhitelistCommand(command);
  };

  isMaster = client => {
    return this.master === client.info.userid;
  };

  setMaster = client => {
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
  };

  clearMaster = () => {
    this.setMaster(null);
  };

  setMasterTimeout = () => {
    const masterTime = +config.master_time;

    clearTimeout(this.masterTimeout);

    debug('Master timeout: %s min', masterTime);

    this.masterTimestamp = Date.now();

    this.masterTimeout = setTimeout(() => {
      debug('Rotating master');

      this.clientsManager.rotate();

      this.setMaster(this.clientsManager.first());
    }, masterTime * 60 * 1000);
  };

  isWhitelistCommand(cmd) {
    return (MasterMode.commandWhitelist.indexOf(cmd) !== -1);
  }
}
