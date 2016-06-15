import io from 'socket.io-client';

class Network {
  constructor(host = window.location.hostname, port = 3000) {
    this.url = `ws://${host}:${port}/`;

    this.socket = io(this.url);
  }

  send(name, data) {
    this.socket.emit(name, data);
  }

  command(command, ...args) {
    this.send('command', {
      command: command,
      args: args.map(String)
    });
  }

  commands(commands) {
    const cmds = commands.map(command => {
      command.args = command.args.map(String);

      return command;
    });

    this.send('commands', cmds);
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

export default new Network();
