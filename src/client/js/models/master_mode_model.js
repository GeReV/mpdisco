const _ = require('lodash');

const EventEmitter = require('events').EventEmitter;
const util = require('util');

const MasterModeModel = network => {
  this.network = network;

  this.userid = null;
  this.master = null;

  this.network.on('connected', this.connected.bind(this));
  this.network.on('master', this.setMaster.bind(this));
};

util.inherits(MasterModeModel, EventEmitter);

_.extend(MasterModeModel.prototype, {
  connected(info) {
    this.userid = info.userid;
    this.master = info.master;

    this.emit('connected', this.userid);
    this.emit('master', this.master);
  },

  setMaster(master) {
    this.master = master;

    this.emit('master', this.master);
  }
});

module.exports = MasterModeModel;
