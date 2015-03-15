var React = require('react/addons');

var Logo = require('./logo.jsx');
var Player = require('./player.jsx');
var Playlist = require('./playlist.jsx');
var Library = require('./library.jsx');
var Listeners = require('./listeners.jsx');

//var Error = require('error');

var LibraryModel = require('./models/library_model.js');

var BasicMode = React.createClass({
  componentWillMount: function() {
    var network = this.props.network;

    this.library = new LibraryModel(network);
  },

  render: function () {
    return (
        <div id="container" role="main">
          <header id="player-head">
            <Logo blurRadius={10} />
            <Player controller={this.props.controller} />
          </header>
          <main>
            <Library model={this.library} />
            <Playlist controller={this.props.controller} />
            <Listeners controller={this.props.controller} />
          </main>
        </div>
    );
  }
});

module.exports = BasicMode;