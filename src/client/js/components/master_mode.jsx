import React, {Component} from 'react';
import {
  provideReactor,
  nuclearComponent
} from 'nuclear-js-react-addons';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import getters from '../getters';

import Logo from './logo.jsx';
import Player from './player.jsx';
import Playlist from './playlist.jsx';
import Library from './library.jsx';
import Listeners from './master_mode_listeners.jsx';

import withContext from '../decorators/withContext';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/mpdisco.scss';

@provideReactor
@nuclearComponent(props => {
  return {
    me: getters.me,
    master: getters.currentMaster,
    song: getters.currentSong,
    library: getters.library,
    playlist: getters.playlist,
    listeners: getters.listeners,
  };
})
@withContext
@withStyles(styles)
@DragDropContext(HTML5Backend)
class MasterMode extends Component {
  constructor () {
    super();

    this.state = {
      userid: null,
    };
  }

  render () {
    const enabled = (this.props.master && this.props.master === this.props.me.get('userid'));

    return (
      <div id="container" role="main">
        <header id="player-head">
          <Logo blurRadius={10}/>
          <Player song={this.props.song} enabled={enabled}/>
        </header>
        <main>
          <Library library={this.props.library} enabled={enabled}/>
          <Playlist playlist={this.props.playlist} song={this.props.song} enabled={enabled}/>
          <Listeners listeners={this.props.listeners} me={this.props.me} />
        </main>
      </div>
    );
  }

  setUser (userid) {
    this.setState({userid: userid});
  }
}

export default MasterMode;
