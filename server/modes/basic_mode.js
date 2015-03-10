var Class = require('clah'),
    debug = require('debug')('mpdisco:mode'),
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

function execute (mpd, command, args, client) {
  var cmd;

  args = sanitizeArgs(ensureArray(args));

  cmd = mpdcmd(command, args);

  debug('Received: %s %s', command, JSON.stringify(args));

  mpd.sendCommand(cmd, function(err, result) {

    // First parse the result.
    var parser = commandParsers.parserForCommand(command, args);

    var response = parser.parse(result);

    // Then emit it to the client.
    var emitter = commandEmitters.emitterForCommand(command);

    emitter(command, args, response, client);
  });
}

var clientsManager = ClientsManager.instance();

var BasicMode = Class.extend({
  init: function(mpd) {
    this.type = 'freeforall';
    this.mpd = mpd;
  },
  connected: function(client) {
    client.emit('connected', {
      id: client.info.userid,
      info: client.info,
      clients: clientsManager.clientsInfo(),
      mode: this.type
    });
  },
  command: function(command, args, client) {

    command = command.toLowerCase();

    if (this.canExecute(command, client)) {

      args = sanitizeArgs(ensureArray(args));

      // Run the command through the processor, which calls back with modified args (e.g. Youtube stream from url).
      var promise = commandProcessors.processorForCommand(this.mpd, command, args);

      promise
          .then(function(args) {
            execute(this.mpd, command, args, client);
          }.bind(this))
          .fail(function(error) {
            console.log('Failed to run command: %s (%s) for user %s', command, JSON.stringify(args), client.info.userid);
            console.log('Error: %s', error);

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
  },
  // TODO: Review this.
  commands: function(cmds, client) {

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
  },
  canExecute: function(command, client) {
    return !!clientsManager.get(client.info.userid);
  }
});

BasicMode.create = function(mpd) {
  return new BasicMode(mpd);
};

module.exports = BasicMode;
