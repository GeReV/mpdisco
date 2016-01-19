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

exports.currentMaster = [
  exports.player,
  player => player.get('master')
];

exports.playlist = [
  ['playlist'],
  playlist => playlist.get('playlist')
];

exports.library = [
  ['library'],
  library => library
];

exports.listeners = [
  ['listeners'],
  listeners => listeners.get('listeners')
];

exports.me = [
  ['listeners'],
  listeners => listeners.get('me')
];

exports.playlist = [
  ['playlist'],
  playlist => playlist.get('playlist')
];
