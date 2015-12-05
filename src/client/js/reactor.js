import { Reactor } from 'nuclear-js';

import PlayerStateStore from './stores/player_state_store.js';
import LibraryStore from './stores/library_store.js';
import PlaylistStore from './stores/playlist_store.js';

const reactor = new Reactor({ debug: DEBUG });

reactor.registerStores({
  library: LibraryStore,
  playlist: PlaylistStore,
  player: PlayerStateStore
});

export default reactor;
