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

  componentWillMount: function() {
    var network = this.props.network;

    this.library   = new LibraryModel(network);
    this.listeners = new ListenersModel(network);
    this.player    = new PlayerModel(network);
    this.playlist  = new PlaylistModel(network);

    network.on('connected', this.connected);
    network.on('master', this.setMaster);
  },

  render: function () {
    var enabled = (this.state.master && this.state.master === this.state.userid);

    return (
        <div id="container" role="main">
          <header id="player-head">
            <Logo model={this.player} blurRadius={10} />
            <Player model={this.player} enabled={enabled} />
          </header>
          <main>
            <Library model={this.library} enabled={enabled} />
            <Playlist model={this.playlist} player={this.player} enabled={enabled} />
            <Listeners model={this.listeners} />
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