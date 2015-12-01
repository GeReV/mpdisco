import io from 'socket.io-client';
import _ from 'lodash';

class Network {
  constructor(host, port) {
    this.url = "ws://" + host + ":" + port + "/";

    this.socket = io.connect(this.url);
  }

  send(name, data) {
    this.socket.emit(name, data);
  }

  command(command) {
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
  }

  commands(commands) {
    commands = commands.map(function (command) {

      command.args = command.args.map(String);

      return command;
    });

    this.send('commands', commands);
  }

  once(name, callback) {
    this.socket.once(name, callback);
  }

  on(name, callback) {
    this.socket.on(name, callback);
  }

  off(name, callback) {
    this.socket.off(name, callback);
  }
}

export default Network;
