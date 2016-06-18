import { Store, toImmutable, Immutable } from 'nuclear-js';
import actions from '../action_types.js';

export default Store({
  getInitialState() {
    return toImmutable({
      artists: {}
    });
  },

  initialize() {
    this.on(actions.RECEIVE_LIBRARY_ARTISTS, mergeArtists);
    this.on(actions.RECEIVE_LIBRARY_ALBUMS, mergeAlbums);
    this.on(actions.RECEIVE_LIBRARY_SONGS, mergeSongs);
  }
});

const artistSelector = (artist) => ['artists', artist];
const albumSelector = (artist, album) => ['artists', artist, 'albums', album];

function dasherize(s) {
  if (!s) {
    return s;
  }

  return s
    .replace(/^\s+|\s+$/, '')
    .replace('&', ' and ')
    .replace(/[^\w\-,\.\s]+/g, '')
    .replace(/[,\s\-_]+/g, '-')
    .toLowerCase();
}

function mergeArtists(state, { artists }) {
  const map = Immutable.Map(artists.map(a => [a.name, toImmutable(a)]));

  return state.mergeDeepIn(['artists'], map);
}

function mergeAlbums(state, { artist, albums }) {
  const map = Immutable.Map(albums.map(album => {
    const result = toImmutable(album)
      .set('cover', `/covers/${dasherize(artist)}/${dasherize(album.name)}`)
      .set('artist', state.getIn(artistSelector(artist)));

    return [result.get('name'), result];
  }));

  return state
    .mergeDeepIn(['artists', artist, 'albums'], map)
    .setIn(['artists', artist, 'loaded'], true);
}

function mergeSongs(state, { artist, album, songs }) {
  const map = Immutable.Map(songs.map(song => {
    const result = toImmutable(song)
      .set('artist', state.getIn(artistSelector(artist)))
      .set('album', state.getIn(albumSelector(artist, album)));

    return [result.get('title'), result];
  }));

  return state
    .mergeDeepIn(['artists', artist, 'albums', album, 'songs'], map)
    .setIn(['artists', artist, 'albums', album, 'loaded'], true);
}
