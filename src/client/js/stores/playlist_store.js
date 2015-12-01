import { Store, toImmutable } from 'nuclear-js';

export default Store({
  getInitialState() {
    return toImmutable({
      playlist: []
    });
  },

  initialize() {
  }
});
