var React = require('react/addons');

var Logo = require('./logo.jsx');
var Player = require('./player.jsx');
var Playlist = require('./playlist.jsx');
var Library = require('./library.jsx');
var Listeners = require('./listeners.jsx');

//var Error = require('error');

var BasicMode = React.createClass({
  render: function () {
    return (
        <div id="container" role="main">
          <header id="player-head">
            <Logo blurRadius={10} />
            <Player controller={this.props.controller} />
          </header>
          <main>
            <Library controller={this.props.controller} />
            <Playlist controller={this.props.controller} />
            <Listeners controller={this.props.controller} />
          </main>
        </div>
    );
  }
});

module.exports = BasicMode;