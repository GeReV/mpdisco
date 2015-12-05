import { Store, toImmutable, Immutable } from 'nuclear-js';
import {
    RECEIVE_LIBRARY_ARTISTS,
    RECEIVE_LIBRARY_ALBUMS,
    RECEIVE_LIBRARY_SONGS,
  } from '../action_types.js';

export default Store({
  getInitialState() {
    return toImmutable({
      artists: {}
    });
  },

  initialize() {
    this.on(RECEIVE_LIBRARY_ARTISTS, mergeArtists)
    this.on(RECEIVE_LIBRARY_ALBUMS, mergeAlbums)
    this.on(RECEIVE_LIBRARY_SONGS, mergeSongs)
  }
});

const artistSelector = (artist) => ['artists', artist];
const albumSelector = (artist, album) => ['artists', artist, 'albums', album];

function mergeArtists(state, { artists }) {
  const map = Immutable.Map(artists.map(a => [a.name, toImmutable(a)]));

  return state.mergeDeepIn(['artists'], map);
}

function mergeAlbums(state, { artist, albums }) {
  const map = Immutable.Map(albums.map(album => {
    album = toImmutable(album)
      .set('artist', state.getIn(artistSelector(artist)));

    return [album.get('name'), album]
  }));

  return state.mergeDeepIn(['artists', artist, 'albums'], map);
}

function mergeSongs(state, { artist, album, songs }) {
  const map = Immutable.Map(songs.map(song => {
    song = toImmutable(song)
      .set('artist', state.getIn(artistSelector(artist)))
      .set('album', state.getIn(albumSelector(artist, album)));

    return [song.get('title'), song]
  }));

  return state.mergeDeepIn(['artists', artist, 'albums', album, 'songs'], map);
}
