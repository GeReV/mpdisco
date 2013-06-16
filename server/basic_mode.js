(function() {
  var Class = require('clah'),
      _ = require('underscore');
  
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
      if (!_.isArray(args)) {
        args = [args]; // Ensure array.
      }
      
      console.log(args);
      
      this.mpd.command(command, args, function(err, result) {
        console.log('Result for command', command, ': ', result);
        
        client.emit(command, result);
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
