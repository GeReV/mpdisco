(function() {
  var Class = require('clah'),
      mpd = require('mpd'),
      _ = require('underscore');

  function trim(s) {
    if (!s) {
        return s;
    }

    return s.replace(/^\s+|\s+$/g, '');
  }

  function parseResponse(s) {
    var lines = s.split('\n'),
        json = {};

    _(lines).chain().compact().each(function(l) {
      var i = l.indexOf(':'),
          key = l.slice(0, i),
          value = l.slice(i + 1);

      json[key] = trim(value);
    });

    return json;
  }

  var BasicMode = Class.extend({
    init: function(mpd, clients, cmdProcessors) {
      this.type = 'freeforall';

      this.mpd = mpd;
      this.clients = clients;

      this.commandProcessors = cmdProcessors;
    },
    command: function(command, args, client) {
      var processor;

      if (this.canExecute(command, client)) {

        console.log('Received command', command, 'from', client.userid);

        if (!_.isArray(args)) {
          args = [args];
        }

        processor = this.commandProcessors[command];

        if (processor) {

          // Run the command through the processor, which calls back with modified args (e.g. Youtube stream from url).
          processor(this.mpd, args, function(args) {
            this.execute(command, args, client);
          }.bind(this));

        }else{
          this.execute(command, args, client);
        }

        return;
      }

      client.emit(command, {
        type: 'nopermission'
      });
    },
    canExecute: function() {
      return true;
    },
    execute: function(command, args, client) {
      var cmd;

      if (!_.isArray(args)) {
        args = [args]; // Ensure array.
      }

      console.log(args);

      cmd = mpd.cmd(command, args);

      this.mpd.sendCommand(cmd, function(err, result) {
        console.log('Result for command', command, ': ', parseResponse(result));

        client.emit(command, parseResponse(result));
      });
    }
  });

  if (this.define && define.amd) {
    // Publish as AMD module
    define(function() {
      return BasicMode;
    });
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = BasicMode;
  }
})();
