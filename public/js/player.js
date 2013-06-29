define(['mpdisco'], function(MPDisco) {
  var Player = MPDisco.module('Player', function(Player, MPDisco, Backbone, Marionette) {
    Player.Song = MPDisco.Model.extend({
      defaults: {
        title: 'Title',
        artist: 'Artist',
        album: 'Album'
      },
      socketEvents: {
        currentsong: 'set'
      }
    });
    
    Player.PlayerView = Marionette.ItemView.extend({
      template: '#player_template',
      
      className: 'player',
      
      model: new Player.Song,
      
      modelEvents: {
        change: 'render'
      },
      
      events: {
        'click .prev': 'prevSong',
        'click .next': 'nextSong',
        'click .stop': 'stopSong',
        'click .play': 'playSong',
        'click .pause': 'pauseSong',
      },
      
      ui: {
        buttons: '.btn',
        prev: '.prev',
        next: '.next',
        stop: '.stop',
        play: '.play',
        shuffle: '.shuffle',
        repeat: '.repeat',
        playIcon: '.play i'
      },
      
      initialize: function() {
        MPDisco.network.command('currentsong');
        
        this.listenTo(MPDisco.state, 'change', function() {
          this.updatePlayer();
        });
      },
      
      onShow: function() {
        $(document).on('keyup.player', this.handleKeyboard.bind(this));
      },
      
      onClose: function() {
        $(document).off('keyup.player');
      },
      
      updatePlayer: function() {
        this.ui.play.toggleClass('pause', (MPDisco.state.get('state') === 'play'));
        this.ui.playIcon.toggleClass('icon-pause', (MPDisco.state.get('state') === 'play'));
        this.ui.playIcon.toggleClass('icon-play', (MPDisco.state.get('state') !== 'play'));
      },
      
      updateMaster: function(master) {
        this.$('.master').html(master);
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
        if (MPDisco.state.get('state') === 'pause') {
          MPDisco.command('pause', 0);
        } else {
          MPDisco.command('play');
        }
      },
      pauseSong: function() {
        MPDisco.command('pause', 1);
      },
      
      handleKeyboard: function(e) {
        if (e.which === 0x20) {
          (MPDisco.state.get('state') !== 'play') ? this.playSong() : this.pauseSong();
          
          e.preventDefault();
        }
      }
      
    });
  });
  
  return Player;
});