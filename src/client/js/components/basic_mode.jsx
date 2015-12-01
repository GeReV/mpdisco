import React, { Component } from 'react';

import Logo from './logo.jsx';
import Player from './player.jsx';
import Playlist from './playlist.jsx';
import Library from './library.jsx';
import Listeners from './listeners.jsx';

//var Error = require('error');

class BasicMode extends Component {
  render() {
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
}

export default BasicMode;
