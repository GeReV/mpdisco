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
      
      className: 'player',
      
      model: new Controls.Song,
      
      modelEvents: {
        change: 'render'
      },
      
      events: {
        'click .prev': 'prevSong',
        'click .next': 'nextSong',
        'click .stop': 'stopSong',
        'click .play': 'playSong',
        'click .pause': 'pauseSong'
      },
      
      ui: {
        buttons: '.btn',
        prev: '.prev',
        next: '.next',
        stop: '.stop',
        play: '.play',
        playIcon: '.play i'
      },
      
      initialize: function() {
        this.listenTo(MPDisco.state, 'change:state', this.updateControls);
      },
      
      updateControls: function() {
        this.ui.buttons.prop('disabled', false);
        
        this.ui.play.toggleClass('pause', (MPDisco.state.get('state') === 'play'));
        this.ui.playIcon.toggleClass('icon-pause', (MPDisco.state.get('state') === 'play'));
        this.ui.playIcon.toggleClass('icon-play', (MPDisco.state.get('state') !== 'play'));
      },
      
      prevSong: function() {
        this.ui.prev.prop('disabled', true);
        
        MPDisco.network.command('previous');
      },
      nextSong: function() {
        this.ui.next.prop('disabled', true);
        
        MPDisco.network.command('next');
      },
      stopSong: function() {
        this.ui.stop.prop('disabled', true);
        
        MPDisco.network.command('stop');
      },
      playSong: function() {
        if (MPDisco.state.get('state') === 'pause') {
          MPDisco.network.command('pause', 0);
        } else {
          MPDisco.network.command('play');
        }
      },
      pauseSong: function() {
        this.ui.play.prop('disabled', true);
        
        MPDisco.network.command('pause', 1);
      }
      
    });
  });
  
  return Controls;
});