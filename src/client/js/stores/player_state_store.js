

import { Store, toImmutable } from 'nuclear-js';

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
  }
});
