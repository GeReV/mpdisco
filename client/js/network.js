var io = require('socket.io-client');
var _ = require('underscore');

var Network = function(host, port) {
  this.url = "ws://" + host + ":" + port + "/";

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

    this.send('command', {
      command: command,
      args: args
    });
  },
  commands: function (commands) {
    this.send('commands', commands);
  },
  on: function (name, callback) {
    this.socket.on(name, callback);
  },
  off: function (name, callback) {
    this.socket.off(name, callback);
  }
});

module.exports = Network;
