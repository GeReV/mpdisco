import React, { Component } from 'react';

import Logo from './logo.jsx';
import Player from './player.jsx';
import Playlist from './playlist.jsx';
import Library from './library.jsx';
import Listeners from './master_mode_listeners.jsx';

//var Error = require('error');

import MasterModeModel from '../models/master_mode_model.js';

class MasterMode extends Component {
  constructor() {
    super();

    this.state = {
      userid: null,
      master: null
    };
  }

  componentWillMount() {
    this.model = new MasterModeModel(this.props.network);
  }

  componentDidMount() {
    this.model.on('connected', this.setUser);
    this.model.on('master', this.setMaster);
  }

  render() {
    const enabled = (this.state.master && this.state.master === this.state.userid);

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
  }

  setUser(userid) {
    this.setState({
      userid: userid
    });
  }

  setMaster(master) {
    this.setState({
      master: master
    });
  }
}

export default MasterMode;
