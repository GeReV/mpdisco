import dbg from 'debug';
import mpd from 'mpd';

import _ from 'underscore';
import ClientsManager from '../clients_manager.js';

import commandProcessors from '../command_processors.js';
import commandParsers from '../command_parsers.js';
import commandEmitters from '../command_emitters.js';

const debug = dbg('mpdisco:mode');

const mpdcmd = mpd.cmd;

function sanitizeArgs(args) {
  return args.map(String);
}

function ensureArray(args) {
  return _.isArray(args) ? args : [args];
}

function execute(mpd, command, args, client) {
  let cmd;

  const sanitizedArgs = sanitizeArgs(ensureArray(args));

  cmd = mpdcmd(command, sanitizedArgs);

  debug('Received: %s %s', command, JSON.stringify(sanitizedArgs));

  mpd.sendCommand(cmd, (err, result) => {
    debug('Result:\n%s', result);

    // First parse the result.
    const parser = commandParsers.parserForCommand(command, sanitizedArgs);

    const response = parser.parse(result);

    debug('Parsed response:\n%s', JSON.stringify(response));

    // Then emit it to the client.
    const emitter = commandEmitters.emitterForCommand(command);

    emitter(command, args, response, client);
  });
}

const clientsManager = ClientsManager.instance();

export default class BasicMode {
  static create(mpd) {
    return new BasicMode(mpd);
  }

  constructor(mpd) {
    this.type = 'freeforall';
    this.mpd = mpd;
  }

  connected(client) {
    client.emit('connected', {
      userid: client.info.userid,
      info: client.info,
      clients: clientsManager.clientsInfo(),
      mode: this.type
    });
  }

  command(command, args, client) {
    const cmd = command.toLowerCase();

    if (this.canExecute(cmd, client)) {
      const sanitizedArgs = sanitizeArgs(ensureArray(args));

      // Run the command through the processor, which calls back with modified
      // args (e.g. Youtube stream from url).
      const promise = commandProcessors
        .processorForCommand(this.mpd, cmd, sanitizedArgs);

      promise
          .then(arg => execute(this.mpd, cmd, arg, client))
          .fail(error => {
            debug('Failed to run command: %s (%s) for user %s',
              cmd,
              JSON.stringify(args),
              client.info.userid);

            debug('Error: %s', error);

            client.emit('error', {
              command: cmd,
              args: args
            });
          });
    } else {
      console.log('nopermission', cmd);

      client.emit(cmd, {
        type: 'nopermission'
      });
    }
  }
  // TODO: Review this.
  commands(commands, client) {
    let cmds = commands || [];

    cmds = cmds.map(cmd => {
      cmd.args = sanitizeArgs(ensureArray(cmd.args));

      return cmd;
    });

    if (_.all(cmds, cmd => this.canExecute(cmd, client))) {
      // TODO: Processing each command asynchronously is a bit of a problem. Skipping for now.

      cmds = cmds.map(cmd => mpdcmd(cmd.command, cmd.args));

      debug(cmds);

      this.mpd.sendCommands(cmds, (err, result) => {
        debug('Result for command list');
        debug(cmds);
        debug('===');
        debug(result);
      });
    }
  }

  canExecute(command, client) {
    return !!clientsManager.get(client.info.userid);
  }
}
