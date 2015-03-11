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

var MasterMode = React.createClass({
  getInitialState: function() {
    return {
      userid: null,
      master: null
    };
  },

  componentDidMount: function() {
    this.props.network.on('connected', this.connected);
    this.props.network.on('master', this.setMaster);
  },

  render: function () {
    var network = this.props.network;

    var library   = new LibraryModel(network);
    var listeners = new ListenersModel(network);
    var player    = new PlayerModel(network);
    var playlist  = new PlaylistModel(network);

    var enabled = (this.state.master && this.state.master === this.state.userid);

    return (
        <div id="container" role="main">
          <header id="player-head">
            <Logo model={player} blurRadius={10} />
            <Player model={player} enabled={enabled} />
          </header>
          <main>
            <Library model={library} enabled={enabled} />
            <Playlist model={playlist} player={player} enabled={enabled} />
            <Listeners model={listeners} />
          </main>
        </div>
    );
  },

  connected: function(info) {
    this.setState(info);
  },

  setMaster: function(master) {
    this.setState({
      master: master
    });
  }
});

module.exports = MasterMode;