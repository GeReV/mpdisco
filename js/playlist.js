define(['mpdisco'], function(MPDisco) {  
  var Playlist = MPDisco.module('Playlist', function(Playlist, MPDisco) {
    
    Playlist.Collection = MPDisco.Collection.extend({
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
      
      initialize: function() {
        this.listenTo(this.collection, 'reset', this.render);
        
        MPDisco.network.send({
          command: 'playlistinfo'
        });
      }
    });
  
  });
  
  return Playlist;
});
