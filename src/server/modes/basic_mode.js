var debug = require('debug')('mpdisco:mode'),
    mpd = require('mpd'),
    mpdcmd = mpd.cmd,
    _ = require('underscore'),
    ClientsManager = require('../clients_manager.js'),

    commandProcessors = require('../command_processors.js'),
    commandParsers = require('../command_parsers.js'),
    commandEmitters = require('../command_emitters.js');

function sanitizeArgs(args) {
  return args.map(String);
}

function ensureArray(args) {
  return _.isArray(args) ? args : [args];
}

function execute(mpd, command, args, client) {
  var cmd;

  args = sanitizeArgs(ensureArray(args));

  cmd = mpdcmd(command, args);

  debug('Received: %s %s', command, JSON.stringify(args));

  mpd.sendCommand(cmd, (err, result) => {

    debug('Result:\n%s', result);

    // First parse the result.
    const parser = commandParsers.parserForCommand(command, args);

    const response = parser.parse(result);

    debug('Parsed response:\n%s', JSON.stringify(response));

    // Then emit it to the client.
    const emitter = commandEmitters.emitterForCommand(command);

    emitter(command, args, response, client);
  });
}

var clientsManager = ClientsManager.instance();

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

    command = command.toLowerCase();

    if (this.canExecute(command, client)) {

      args = sanitizeArgs(ensureArray(args));

      // Run the command through the processor, which calls back with modified args (e.g. Youtube stream from url).
      const promise = commandProcessors.processorForCommand(this.mpd, command, args);

      promise
          .then(args => execute(this.mpd, command, args, client))
          .fail(function(error) {
            debug('Failed to run command: %s (%s) for user %s', command, JSON.stringify(args), client.info.userid);
            debug('Error: %s', error);

            client.emit('error', {
              command: command,
              args: args
            });
          });

    } else {
      console.log('nopermission', command);

      client.emit(command, {
        type: 'nopermission'
      });
    }
  }
  // TODO: Review this.
  commands(cmds, client) {

    cmds = cmds || [];

    cmds = cmds.map(function(cmd) {
      cmd.args = sanitizeArgs(ensureArray(cmd.args));

      return cmd;
    });

    if (_.all(cmds, function(cmd) { return this.canExecute(cmd, client); }, this)) {

      // TODO: Processing each command asynchronously is a bit of a problem. Skipping for now.

      cmds = cmds.map(function(cmd) {
        return mpdcmd(cmd.command, cmd.args);
      });

      debug(cmds);

      this.mpd.sendCommands(cmds, function(err, result) {

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
