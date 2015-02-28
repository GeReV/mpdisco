var io = require('./vendor/socket.io-client/socket.io.js');
var _ = require('./vendor/underscore/underscore.js');

var Network = function(host, port) {
  this.url = "ws://" + host + ":" + port + "/";
  this.callbacks = [];

  this.socket = io.connect(this.url);
};

_.extend(Network.prototype, {
  send: function (name, data) {
    this.socket.emit(name, data);
  },
  command: function (command) {

    var args = [];

    if (arguments.length === 2 && _.isArray(arguments[1])) {
      args = arguments[1];
    } else if (arguments.length > 1) {
      args = _.rest(arguments);
    }

    this.socket.emit('command', {
      command: command,
      args: args
    });
  },
  commands: function (commands) {
    this.socket.emit('commands', commands);
  },
  publish: function (name, data) {
    for (var i = 0, l = this.callbacks.length; i < l; i++) {
      this.callbacks[i](name, data);
    }
  },
  subscribe: function (callback) {
    this.callbacks.push(callback);
  },
  unsubscribe: function (callback) {
    for (var i = 0, l = this.callbacks.length; i < l; i++) {
      if (this.callbacks[i] === callback) {
        this.callbacks.splice(i, 1);
      }
    }
  },
  on: function (name, callback) {
    this.socket.on(name, callback);
  },
  off: function (name, callback) {
    this.socket.off(name, callback);
  },
  createPublish: function (name) {
    return function (data) {
      this.publish(name, data);
    }.bind(this);
  }
});

module.exports = Network;
