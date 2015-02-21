var React = require('./vendor/react/react-with-addons.js');

var Playlist = require('./playlist.jsx');
var Library = require('./library.jsx');

//var Error = require('error');

var LibraryModel = require('./library_model.js');

var MPDisco = React.createClass({
  render: function () {
    var library = new LibraryModel(window.MPDisco.network);

    return (
      <div id="container" role="main">
        <header id="player-head">
          <section id="player"></section>
          <section id="user"></section>
          <section id="scrubber"></section>
        </header>
        <section id="main">
          <Library model={library} />
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