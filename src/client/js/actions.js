import reactor from './reactor.js';
import network from './network.js';

export default {
  fetchLibraryArtists() {
    network.command('list', 'artist');
  },

  fetchLibraryAlbums(artist) {
    network.command('list', ['album', artist]);
  },

  fetchLibrarySongs(artist, album) {
    network.command('find', ['artist', artist, 'album', album]);
  },

  fetchStatus() {
    network.command('status');
  },

  fetchCurrentSong() {
    network.command('currentsong');
  },

  fetchListeners() {
    network.send('clientslist');
  },

  fetchPlaylist() {
    network.command('playlistinfo');
  },
}
