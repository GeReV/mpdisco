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
        'click .shuffle': 'toggleShuffle',
        'click .repeat': 'toggleRepeat'
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
        
        this.listenTo(MPDisco.state, 'change', this.updatePlayer);
      },
      
      onShow: function() {
        $(document).on('keyup.player', this.handleKeyboard.bind(this));
      },
      
      onClose: function() {
        $(document).off('keyup.player');
      },
      
      updatePlayer: function() {
        this.ui.buttons.prop('disabled', false);
        
        this.ui.play.toggleClass('pause', (MPDisco.state.get('state') === 'play'));
        this.ui.playIcon.toggleClass('icon-pause', (MPDisco.state.get('state') === 'play'));
        this.ui.playIcon.toggleClass('icon-play', (MPDisco.state.get('state') !== 'play'));
        
        this.ui.shuffle.toggleClass('active', (MPDisco.state.get('random') === '1'));
        this.ui.repeat.toggleClass('active', (MPDisco.state.get('repeat') === '1'));
        this.ui.repeat.toggleClass('single', (MPDisco.state.get('single') === '1'));
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
        this.ui.play.prop('disabled', true);
        
        MPDisco.command('pause', 1);
      },
      toggleShuffle: function() {
        var state = (~MPDisco.state.get('random') & 1);
        
        this.ui.shuffle.toggleClass('active', state);
        
        MPDisco.command('random', state);
      },
      toggleRepeat: function() {
        var repeat = +MPDisco.state.get('repeat'),
            single = +MPDisco.state.get('single');
            
        if (repeat && single) {
          this.ui.repeat.removeClass('active single');
          
          MPDisco.commands([
            { command: 'repeat', args: 0 },
            { command: 'single', args: 0 }
          ]);
        } else if (repeat) {
          this.ui.repeat.addClass('single');
          
          MPDisco.command('single', 1);
        }else {
          this.ui.repeat.addClass('active');
          
          MPDisco.command('repeat', 1);
        }
      },
      
      handleKeyboard: function(e) {
        if (e.which === 0x20) {
          (MPDisco.state.get('state') !== 'play') ? this.playSong() : this.pauseSong();
          
          return false;
        }
      }
      
    });
  });
  
  return Player;
});