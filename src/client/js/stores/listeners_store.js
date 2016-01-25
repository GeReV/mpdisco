import { Store, toImmutable } from 'nuclear-js';

import {
  RECEIVE_LISTENERS,
  RECEIVE_ME
} from '../action_types';

export default Store({
  getInitialState() {
    return toImmutable({
      me: null,
      listeners: []
    });
  },

  initialize() {
    this.on(RECEIVE_ME, updateMe);
    this.on(RECEIVE_LISTENERS, updateListeners);
  }
});

function updateListeners(state, { listeners, me }) {
  return state
    .set('listeners', toImmutable(listeners))
    .set('me', toImmutable(me));
}

function updateMe(state, { me }) {
  return state
    .set('me', toImmutable(me));
}
