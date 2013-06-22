define(['class', 'underscore', 'mpdisco'], function(Class, _, MPDisco) {
  var Syncer = Class.extend({
    init: function() {
      MPDisco.vent.on('update connected', this.update, this);
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
      }
      
      MPDisco.command(command, args);
    },
    commands: {
      //playlist: 'playlistinfo',
      database: {
        command: 'list',
        args: 'artist'
      },
      player: ['currentsong', 'status'],
      connected: ['currentsong', 'status', 'playlistinfo']
    }
  });
  
  MPDisco.Syncer = Syncer;
  
  MPDisco.syncer = new Syncer;
  
  return Syncer;
});