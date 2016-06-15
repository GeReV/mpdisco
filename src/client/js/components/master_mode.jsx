import React, {Component} from 'react';
import {
  Provider,
  connect
} from 'nuclear-js-react-addons';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import getters from '../getters';

import reactor from '../reactor';

import Logo from './logo.jsx';
import Player from './player.jsx';
import Playlist from './playlist.jsx';
import Library from './library.jsx';
import Listeners from './master_mode_listeners.jsx';

import withContext from '../decorators/withContext';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/mpdisco.scss';

@connect(() => {
  return {
    me: getters.me,
    master: getters.currentMaster,
    status: getters.currentStatus,
    cover: getters.currentCover,
    song: getters.currentSong,
    library: getters.library,
    playlist: getters.playlist,
    listeners: getters.listeners
  };
})
@withContext
@withStyles(styles)
@DragDropContext(HTML5Backend)
class MasterMode extends Component {
  render() {
    const {
      me,
      song,
      cover,
      status,
      library,
      listeners,
      playlist,
      master
    } = this.props;

    const enabled = !!(master && master === me.get('userid'));

    return (
      <Provider reactor={reactor}>
        <div id="container" role="main">
          <header id="player-head">
            <Logo cover={cover}
                  blurRadius={10}
                  />
            <Player status={status}
                    song={song}
                    enabled={enabled}
                    />
          </header>
          <main>
            <Library library={library}
                     enabled={enabled}
                     />
            <Playlist playlist={playlist}
                      song={song}
                      status={status}
                      enabled={enabled}
                      />
            <Listeners listeners={listeners}
                       master={master}
                       me={me}
                       />
          </main>
        </div>
      </Provider>
    );
  }
}

export default MasterMode;
