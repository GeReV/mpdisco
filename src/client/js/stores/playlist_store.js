import { Store, toImmutable } from 'nuclear-js';

import { RECEIVE_PLAYLIST } from '../action_types';

export default Store({
  getInitialState() {
    return toImmutable({
      playlist: []
    });
  },

  initialize() {
    this.on(RECEIVE_PLAYLIST, updatePlaylist);
  }
});

function updatePlaylist(state, { playlist }) {
  return state.set('playlist', toImmutable(playlist));
}
