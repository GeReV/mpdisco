define(['mpdisco'], function(MPDisco) {
  var Controls = MPDisco.module('Controls', function(Controls, MPDisco, Backbone, Marionette) {
    Controls.Song = MPDisco.Model.extend({
      defaults: {
        name: 'Name',
        artist: 'Artist',
        album: 'Album'
      },
      socket_events: {
        currentsong: 'set'
      }
    });
    
    Controls.ControlsView = Marionette.ItemView.extend({
      template: '#controls_template',
      
      model: new Controls.Song,
      
      initialize: function() {
        this.listenTo(this.model, 'change', function() {
          console.log(this.model);
          this.render();
        });
        
        this.listenTo(MPDisco.vent, 'update', function(system) {
          if (system === 'player') {
            MPDisco.network.command('currentsong');
          }
        });
      }
    });
  });
  
  return Controls;
});