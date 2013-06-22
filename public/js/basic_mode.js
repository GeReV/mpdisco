define(['mpdisco', 'player', 'playlist', 'library'], function(MPDisco, Player, Playlist, Library) {
  
  var BasicMode = MPDisco.module('BasicMode', function(BasicMode, MPDisco) {
    BasicMode.Mode = {
      player: Player.PlayerView,
      playlist: Playlist.PlaylistView,
      library: Library.LibraryView
    };
  });
  
  return BasicMode;
});
