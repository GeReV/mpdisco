var React = require('react/addons');

var Logo = require('./logo.jsx');
var Player = require('./player.jsx');
var Playlist = require('./playlist.jsx');
var Library = require('./library.jsx');
var Listeners = require('./master_mode_listeners.jsx');

//var Error = require('error');

var MasterModeModel = require('./models/master_mode_model.js');

var MasterMode = React.createClass({
  getInitialState: function() {
    return {
      userid: null,
      master: null
    };
  },

  componentWillMount: function() {
    this.model = new MasterModeModel(this.props.network);
  },

  componentDidMount: function() {
    this.model.on('connected', this.setUser);
    this.model.on('master', this.setMaster);
  },

  render: function () {
    var enabled = (this.state.master && this.state.master === this.state.userid);

    return (
        <div id="container" role="main">
          <header id="player-head">
            <Logo blurRadius={10} />
            <Player controller={this.props.controller} enabled={enabled} />
          </header>
          <main>
            <Library controller={this.props.controller} enabled={enabled} />
            <Playlist controller={this.props.controller} enabled={enabled} />
            <Listeners controller={this.props.controller} mastermode={this.model} />
          </main>
        </div>
    );
  },

  setUser: function(userid) {
    this.setState({
      userid: userid
    });
  },

  setMaster: function(master) {
    this.setState({
      master: master
    });
  }
});

module.exports = MasterMode;