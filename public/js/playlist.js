define(['mpdisco'], function(MPDisco) {  
  var Playlist = MPDisco.module('Playlist', function(Playlist, MPDisco) {
    
    Playlist.Collection = MPDisco.Collection.extend({
      initialize: function() {
        this.listenTo(MPDisco.vent, 'update', function(system) {
          if (system === 'playlist') {
            MPDisco.network.command('playlistinfo');
          }
        });
      },
      socket_events: {
        playlistinfo: 'reset'
      }
    });
      
    Playlist.PlaylistItemView = Marionette.ItemView.extend({
      template: '#playlist_item'
    });
    
    Playlist.PlaylistView = Marionette.ItemView.extend({
      template: '#playlist_template',
      
      collection: new Playlist.Collection,
      
      collectionEvents: {
        reset: 'render'
      },
      
      initialize: function() {
        MPDisco.network.command('playlistinfo');
      }
    });
  
  });
  
  return Playlist;
});
