
import { Store, toImmutable } from 'nuclear-js';

import {
  RECEIVE_CURRENT_SONG,
  RECEIVE_STATUS,
  RECEIVE_MASTER
} from '../action_types';

export default Store({
  getInitialState() {
    return toImmutable({
      status: {
        state: 'stop'
      },
      current_song: {
        title: '',
        artist: '',
        album: '',
        time: 0
      },
      cover: null
    });
  },

  initialize() {
    this.on(RECEIVE_CURRENT_SONG, updateCurrentSong);
    this.on(RECEIVE_STATUS, updateStatus);
    this.on(RECEIVE_MASTER, updateMaster);
  }
});

function updateCurrentSong(state, { song }) {
  return state.set('current_song', toImmutable(song));
}

function updateStatus(state, { status }) {
  return state.set('status', toImmutable(status));
}

function updateMaster(state, { master }) {
  return state.set('master', master);
}
