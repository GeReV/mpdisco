define(['mpdisco'], function(MPDisco) {  
  var Playlist = MPDisco.module('Playlist', function(Playlist, MPDisco) {
    
    Playlist.Collection = MPDisco.Collection.extend({
      socketEvents: {
        playlistinfo: 'reset'
      }
    });
      
    Playlist.PlaylistItemView = Marionette.ItemView.extend({
      template: '#playlist_item'
    });
    
    Playlist.PlaylistView = Marionette.ItemView.extend({
      template: '#playlist_template',
      
      ui: {
        playlist: 'ul',
        url: '#url'
      },
      
      collection: new Playlist.Collection,
      
      socketEvents: {
        status: 'updatePlaylist',
        currentsong: 'updatePlaylist'
      },
      
      collectionEvents: {
        reset: 'render'
      },
      
      events: {
        'click #add-button': 'addUrl',
        'dblclick li': 'play'
      },
      
      initialize: function() {
        MPDisco.network.command('playlistinfo');
      },
      
      updatePlaylist: function(status) {
        var songid = status.songid || status.Id;
        
        if (songid) {
          this.ui.playlist
            .find('[data-songid="' + songid + '"]').addClass('current')
            .siblings().removeClass('current');
        }else{
          this.ui.playlist.children().removeClass('current');
        }
      },
      
      addUrl: function() {
        MPDisco.network.command('add', this.ui.url.val());
      },
      
      play: function(e) {
        MPDisco.network.command('playid', $(e.target).data('songid'));
      }
    });
  
  });
  
  return Playlist;
});
