import React, {Component} from 'react';
import {provideReactor, nuclearComponent} from 'nuclear-js-react-addons';

import getters from '../getters';

import Logo from './logo.jsx';
import Player from './player.jsx';
import Playlist from './playlist.jsx';
import Library from './library.jsx';
// import Listeners from './master_mode_listeners.jsx';

import withStyles from '../decorators/withStyles';

import styles from '../../sass/mpdisco.scss';

@provideReactor
@nuclearComponent(props => {
  return {song: getters.currentSong, library: getters.library};
})
@withStyles(styles)
class MasterMode extends Component {
  constructor () {
    super();

    this.state = {
      userid: null,
      master: null
    };
  }

  componentWillMount () {
    // this.model = new MasterModeModel(this.props.network);
  }

  componentDidMount () {
    // this.model.on('connected', this.setUser);
    // this.model.on('master', this.setMaster);
  }

  render () {
    const enabled = (this.state.master && this.state.master === this.state.userid);

    return (
      <div id="container" role="main">
        <header id="player-head">
          <Logo blurRadius={10}/>
          <Player song={this.props.song} enabled={enabled}/>
        </header>
        <main>
          <Library library={this.props.library} enabled={enabled}/>
          <Playlist song={this.props.song} enabled={enabled}/>
          {/*<Listeners controller={this.props.controller} mastermode={this.model} />*/}
        </main>
      </div>
    );
  }

  setUser (userid) {
    this.setState({userid: userid});
  }

  setMaster (master) {
    this.setState({master: master});
  }
}

export default MasterMode;
