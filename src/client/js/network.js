var io = require('socket.io-client');
var _ = require('lodash');

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

    args = args.map(String);

    this.send('command', {
      command: command,
      args: args
    });
  },
  commands: function (commands) {
    commands = commands.map(function(command) {

      command.args = command.args.map(String);

      return command;
    });

    this.send('commands', commands);
  },
  once: function (name, callback) {
    this.socket.once(name, callback);
  },
  on: function (name, callback) {
    this.socket.on(name, callback);
  },
  off: function (name, callback) {
    this.socket.off(name, callback);
  }
});

module.exports = Network;
