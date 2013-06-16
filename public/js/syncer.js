define(['class', 'underscore', 'mpdisco'], function(Class, _, MPDisco) {
  var Syncer = Class.extend({
    init: function() {
      MPDisco.vent.on('update', this.update, this);
    },
    update: function(system) {
      var command = this.commands[system];
      
      if (!command) {
        return;
      }
      
      if (_.isFunction(command)) {
        command(MPDisco.network);
        
        return;
      }
      
      if (_.isArray(command)) {
        _.each(command, this.execute);
        return;
      }
      
      this.execute(command);
    },
    execute: function(cmd) {
      var command = cmd,
          args = null;
      
      if (_.isObject(cmd) && cmd.command) {
        command = cmd.command;
        args = cmd.args;
        return;
      }
      
      MPDisco.network.command(command, args);
    },
    commands: {
      playlist: 'playlistinfo',
      player: 'currentsong'
    }
  });
  
  MPDisco.syncer = new Syncer;
  
  return Syncer;
});