var React = require('react/addons');

var Logo = require('./logo.jsx');
var Player = require('./player.jsx');
var Playlist = require('./playlist.jsx');
var Library = require('./library.jsx');
var Listeners = require('./listeners.jsx');

//var Error = require('error');

var PlayerModel = require('./models/player_model.js');
var PlaylistModel = require('./models/playlist_model.js');
var LibraryModel = require('./models/library_model.js');
var ListenersModel = require('./models/listeners_model.js');

var MPDisco = React.createClass({
  render: function () {
    var library = new LibraryModel(window.MPDisco.network);
    var listeners = new ListenersModel(window.MPDisco.network);
    var player = new PlayerModel(window.MPDisco.network);
    var playlist = new PlaylistModel(window.MPDisco.network);

    return (
      <div id="container" role="main">
        <header id="player-head">
          <Logo model={player} blurRadius={10} />
          <Player model={player} />
        </header>
        <div id="main">
          <Library model={library} />
          <Playlist model={playlist} player={player} />
          <Listeners model={listeners} />
        </div>
      </div>
    );
  }
});

module.exports = MPDisco;