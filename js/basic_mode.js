define(['mpdisco', 'player', 'user', 'playlist', 'library'], function(MPDisco, Player, User, Playlist, Library) {
  
  var BasicMode = MPDisco.module('BasicMode', function(BasicMode, MPDisco) {
    BasicMode.Mode = {
      player: Player.PlayerView,
      user: User.UserView,
      scrubber: Player.ScrubberView,
      playlist: Playlist.PlaylistView,
      listeners: User.Listeners,
      library: Library.LibraryView
    };
  });
  
  return BasicMode;
});
