var React = require('./vendor/react/react.js');

var Playlist = require('./playlist.jsx');
var Library = require('./library.jsx');

//var Error = require('error');

var MPDisco = React.createClass({
  render: function () {
    return (
      <div id="container" role="main">
        <header id="player-head">
          <section id="player"></section>
          <section id="user"></section>
          <section id="scrubber"></section>
        </header>
        <section id="main">
          <Library />
          <div id="player-body">
            <Playlist />
            <section id="listeners"></section>
          </div>
        </section>
      </div>
    );
  }
});

module.exports = MPDisco;