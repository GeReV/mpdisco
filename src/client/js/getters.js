exports.player = [
  ['player'],
  player => player
];

exports.currentSong = [
  exports.player,
  player => player.get('current_song')
];

exports.currentCover = [
  exports.player,
  player => player.get('cover')
];

exports.currentStatus = [
  exports.player,
  player => player.getIn(['status'])
];

exports.playlist = [
  ['playlist'],
  playlist => playlist.get('playlist')
];

exports.library = [
  ['library'],
  library => library
];
