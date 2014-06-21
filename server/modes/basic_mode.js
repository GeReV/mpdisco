(function() {
  var Class = require('clah'),
      mpd = require('mpd'),
      _ = require('underscore'),
      ClientsManager = require('../clients_manager.js')(),
      
      ObjectListParser = require('../response_parsers/object_list_parser.js'),
      SimpleParser = require('../response_parsers/simple_parser.js'),
      LineParser = require('../response_parsers/line_parser.js'),
      
      CoverArt = require('../cover_art.js'),
      
      specialCommands,
      parsers;
      
      
  specialCommands = {
    list: function emitSpecializedEvent(command, args, response, client) {
      if (args.length) {
        //console.log('Emitting:', command);
        
        client.emit(command, response);
        
        //console.log('Emitting:', command + ':' + args[0].toLowerCase());
        
        client.emit(command + ':' + args[0].toLowerCase(), {
          args: args.slice(1),
          data: response
        });
      }
    },
    find: function emitCommandWithEverySecondArg(command, args, response, client) {
      if (args.length) {
        //console.log('Emitting:', command);
        
        client.emit(command, {
          args: _.filter(args, function(v, i) { return (i % 2 == 1); }),
          data: response
        });
      }
    },
    currentsong: function(command, args, response, client) {
      
      client.emit(command, response);
      
      if (response && response.artist && response.album) {
        CoverArt.getCover({ artist: response.artist, release: response.album }, function(url) {
          client.emit('coverart', {
            coverart: url
          });
        },
        function(e) { console.log(e); });
      }
    }
  };
  
  parsers = {
    'list':         new LineParser,
    'list:album':   new LineParser,
    'find':         new ObjectListParser('file'),
    'playlistinfo': new ObjectListParser('file'),
    'simple':       new SimpleParser
  };
  
  function sanitizeArgs(args) {
    return _.map(args, function(arg) {
      return arg ? '' + arg : '';
    });
  }
  
  function ensureArray(args) {
    return _.isArray(args) ? args : [args];
  }
  
  function getParser(command, args) {
    var key = command + ':' + args[0];
    
    return  parsers[key] ||
            parsers[command] ||
            parsers.simple;
  }

  var BasicMode = Class.extend({
    init: function(mpd, cmdProcessors) {
      this.type = 'freeforall';

      this.mpd = mpd;

      this.commandProcessors = cmdProcessors;
    },
    connected: function(client) {
      client.emit('connected', {
        id: client.info.userid,
        info: client.info,
        clients: ClientsManager.clientsInfo(),
        mode: this.type
      });
    },
    command: function(command, args, client) {
      var processor,
          callback = function(args) {
            this.execute(command, args, client);
          }.bind(this),
          error = function(args) {
            
            client.emit('error', {
              command: command,
              args: args
            });
            
          };
      
      command = command.toLowerCase();
      
      args = sanitizeArgs(ensureArray(args));
      
      if (this.canExecute(command, client)) {
        
        processor = this.commandProcessors[command];

        if (processor) {
          
          // Run the command through the processor, which calls back with modified args (e.g. Youtube stream from url).
          processor(this.mpd, args, callback, error);

        }else{
          this.execute(command, args, client);
        }

        return;
      }
      
      console.log('nopermission', command);

      client.emit(command, {
        type: 'nopermission'
      });
    },
    // TODO: Review this.
    commands: function(cmds, client) {
      
      cmds = cmds || [];
      
      cmds = _.map(cmds, function(cmd) {
        if (!_.isArray(cmd.args)) {
          cmd.args = [cmd.args];
        }
        
        cmd.args = sanitizeArgs(cmd.args);
        
        return cmd;
      });
      
      if (_.all(cmds, function(cmd) { return this.canExecute(cmd, client); }, this)) {
        
        // TODO: Processing each command asynchronously is a bit of a problem. Skipping for now.
        
        cmds = _.map(cmds, function(cmd) {
          return mpd.cmd(cmd.command, cmd.args);
        });
        
        console.log(cmds);
        
        this.mpd.sendCommands(cmds, function(err, result) {
          
          console.log('Result for command list');
          console.log(cmds);
          console.log('===');
          console.log(result);
          
        });
        
      }
    },
    canExecute: function(command, client) {
      return !!ClientsManager.get(client.info.userid);
    },
    execute: function(command, args, client) {
      var cmd;

      if (!_.isArray(args)) {
        args = [args]; // Ensure array.
      }
      
      args = sanitizeArgs(args);

      cmd = mpd.cmd(command, args);
      
      console.log(command, args);

      this.mpd.sendCommand(cmd, function(err, result) {
        
        var response = getParser(command, args).parse(result),
            special = specialCommands[command];
        
        //console.log('Result for command', command, ': ', result);
        
        if (special) {
          
          special(command, args, response, client);
          
          return;
          
        }
        
        //console.log('Emitting:', command);
          
        client.emit(command, response);
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
