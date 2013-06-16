define(['mpdisco'], function(MPDisco) {
  var Controls = MPDisco.module('Controls', function(Controls, MPDisco, Backbone, Marionette) {
    Controls.Song = MPDisco.Model.extend({
      defaults: {
        name: 'Name',
        artist: 'Artist',
        album: 'Album'
      },
      socketEvents: {
        currentsong: 'set'
      }
    });
    
    Controls.ControlsView = Marionette.ItemView.extend({
      template: '#controls_template',
      
      model: new Controls.Song,
      
      modelEvents: {
        change: 'render'
      },
      
      events: {
        'click .prev': 'prevSong',
        'click .next': 'nextSong',
        'click .stop': 'stopSong',
        'click .play': 'playSong'
      },
      
      prevSong: function() {
        MPDisco.network.command('previous');
      },
      nextSong: function() {
        MPDisco.network.command('next');
      },
      stopSong: function() {
        MPDisco.network.command('stop');
      },
      playSong: function() {
        MPDisco.network.command('play');
      },
      
    });
  });
  
  return Controls;
});