import reactor from './reactor';
import network from './network.js';
import {
  fetchStatus,
  fetchCurrentSong,
  fetchListeners,
  fetchLibraryArtists,
  fetchPlaylist
} from './actions.js';

import actionTypes from './action_types.js';

class Receiver {
  constructor(net) {
    this.network = net;

    const update = () => {
      fetchStatus();
      fetchCurrentSong();
    };

    this.on('connected', data => {
      if (data.info) {
        reactor.dispatch(actionTypes.RECEIVE_ME, { me: data.info });
      }

      if (data.mode === 'master' && data.master) {
        reactor.dispatch(actionTypes.RECEIVE_MASTER, { master: data.master });
      }

      update();
    });

    this.on('playlistinfo', playlist => {
      reactor.dispatch(actionTypes.RECEIVE_PLAYLIST, { playlist });
    });

    this.on('clientslist', (listeners, me) => {
      reactor.dispatch(actionTypes.RECEIVE_LISTENERS, { listeners, me });
    });

    this.on('status', status => {
      reactor.dispatch(actionTypes.RECEIVE_STATUS, { status });
    });

    this.on('currentsong', song => {
      reactor.dispatch(actionTypes.RECEIVE_CURRENT_SONG, { song });
    });

    this.on('coverart', response => {
      reactor.dispatch(actionTypes.RECEIVE_COVER_ART, { url: response.url });
    });

    this.on('clientdisconnected', fetchListeners);

    this.on('update:database', fetchLibraryArtists);
    this.on('list:artist', res => {
      reactor.dispatch(actionTypes.RECEIVE_LIBRARY_ARTISTS, {
        artists: (res.data || []).map(_ => {
          return {
            name: _.artist,
            albums: {}
          };
        })
      });
    });
    this.on('list:album', res => {
      console.log(res);
      reactor.dispatch(actionTypes.RECEIVE_LIBRARY_ALBUMS, {
        artist: res.args[0],
        albums: res.data.map(_ => {
          return {
            name: _.album,
            artist: null,
            songs: {}
          };
        })
      });
    });
    this.on('find', res => {
      const [artist, album] = res.args;

      reactor.dispatch(actionTypes.RECEIVE_LIBRARY_SONGS, {
        artist,
        album,
        songs: res.data.map(item => {
          const { time, title, albumartist, track, date, genre, composer } = item;

          return {
            time,
            title,
            albumartist,
            track,
            date,
            genre,
            composer,
            album: null,
            artist: null
          };
        })
      });
    });

    this.on('update:player', update);
    this.on('playid', update);
    this.on('repeat', update);
    this.on('random', update);

    this.on('update:playlist', fetchPlaylist);

    this.on('master', master => {
      reactor.dispatch(actionTypes.RECEIVE_MASTER, { master });
    });
  }

  on(event, handler) {
    this.network.on(event, handler);
  }
}

export default new Receiver(network);
