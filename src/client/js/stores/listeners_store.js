import { Store, toImmutable } from 'nuclear-js';

import { RECEIVE_LISTENERS } from '../action_types';

export default Store({
  getInitialState() {
    return toImmutable({
      me: null,
      listeners: []
    });
  },

  initialize() {
    this.on(RECEIVE_LISTENERS, updateListeners);
  }
});

function updateListeners(state, { listeners, me }) {
  return state
    .set('listeners', toImmutable(listeners))
    .set('me', toImmutable(me));
}
