define(['mpdisco', 'player', 'playlist', 'library'], function(MPDisco, Player, Playlist, Library) {
  
  var MasterMode = MPDisco.module('MasterMode', function(MasterMode, MPDisco) {
    MasterMode.PlayerView = Player.PlayerView.extend({
      socketEvents: {
        'connected': 'onConnected',
        'master': 'updateControls'
      },
      
      onDomRefresh: function() {
        Player.PlayerView.prototype.onShow.call(this);
        
        this.updateControls();
      },
      
      onConnected: function(data) {
        this.updateControls(data.master);
      },
      
      updateControls: function(master) {
        var lock = true;
        
        if (MPDisco.client) {
          lock = (master !== MPDisco.client);
        }
        
        this.setLockUI(lock);
      },
      
      setLockUI: function(lock) {
        this.$('.btn').attr('disabled', lock);
      }
    });
    
    MasterMode.Mode = {
      player: MasterMode.PlayerView,
      playlist: Playlist.PlaylistView,
      library: Library.LibraryView
    };
  });
  
  return MasterMode;
});
