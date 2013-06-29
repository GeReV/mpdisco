define(['mpdisco', 'handlebars'], function(MPDisco, Handlebars) {
  
  var Player = MPDisco.module('Player', function(Player, MPDisco, Backbone, Marionette) {
    Player.Song = MPDisco.Model.extend({
      defaults: {
        title: 'Title',
        artist: 'Artist',
        album: 'Album',
        time: '0:0'
      },
      socketEvents: {
        status: 'set',
        currentsong: 'set'
      },
      set: function(attributes) {
        
        if (attributes.time && attributes.time.indexOf(':') === -1) {
          delete attributes.time;
        }
        
        MPDisco.Model.prototype.set.apply(this, arguments);
      }
    });
    
    MPDisco.current = new Player.Song;
    
    Player.PlayerView = Marionette.ItemView.extend({
      template: '#player_template',
      
      className: 'player',
      
      model: MPDisco.current,
      
      modelEvents: {
        change: 'render',
        'change:time': 'updatePlayer'
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
        runningTime: '.time.running'
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
      
      onRender: function() {
        this.updatePlayer();
      },
      
      updatePlayer: function() {
        var model = this.model,
            time = this.model.get('time').split(':'),
            running = +time[0],
            length = +time[1];
        
        this.ui.play.toggleClass('pause', (MPDisco.state.get('state') === 'play'));
        
        // TODO: Place this in the model?
        if (MPDisco.state.get('state') === 'play') {
          clearInterval(this.playInterval);
          
          this.playInterval = setInterval(function() {
            model.set('time', (++running) + ':' + length);
          }, 1000);
          
        } else {
          clearInterval(this.playInterval);
        }
      },
      
      updateTimer: function() {
        var timer = this.ui.runningTime,
            time = +(this.model.get('time')).split(':')[0];
            
        timer.html( MPDisco.Utils.formatSeconds(time) );
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
    
    Player.ScrubberView = Marionette.ItemView.extend({
      className: 'scrubber',
      
      template: '#scrubber_template',
      
      model: MPDisco.current,
      
      modelEvents: {
        'change:time': 'updateScrubber'
      },
      
      ui: {
        progress: '.progress'
      },
      
      initialize: function() {
        this.listenTo(MPDisco.state, 'change', function() {
          this.updateScrubber();
        });
      },
      
      onRender: function() {
        this.updateScrubber();
      },
      
      updateScrubber: function() {
        var progress = this.ui.progress,
            time = this.model.get('time').split(':'),
            running = +(time[0] || 0),
            length = +(time[1] || 1);
            
        progress.css('width', (running / length * 100) + '%' );
      }
    });
  });
  
  return Player;
});