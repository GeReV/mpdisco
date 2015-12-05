import network from './network.js';

import {
  ItemTypes
}
from './constants';

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

  toggleShuffle(random) {
    network.command('random', random);
  },
  toggleRepeat(repeat, single) {
    network.command('repeat', repeat);
    network.command('single', single);
  },
  seek(id, seconds) {
    network.command('seekid', id, seconds);
  },
  play(id) {
    if (id) {
      network.command('playid', id);
    }
    network.command('play');
  },
  stop() {
    network.command('stop');
  },
  pause(pause) {
    if (pause === undefined) {
      pause = true;
    }
    network.command('pause', (pause ? 1 : 0));
  },
  next() {
    network.command('next');
  },
  previous() {
    network.command('previous');
  },

  playlistRemoveItems(items) {
    const commands = items.map(function(item) {
      return {
        command: 'deleteid',
        args: [item.id]
      };
    });

    network.commands(commands);
  },
  playlistAddItem(itemType, item) {
    switch (itemType) {
      case ItemTypes.ARTIST:
        item = item.artist;

        network.command('findadd', 'artist', item.get('name'));

        break;
      case ItemTypes.ALBUM:
        item = item.album;

        network.command('findadd', 'artist', item.getIn(['artist', 'name']), 'album', item.get('name'));

        break;
      case ItemTypes.SONG:
        item = item.song;

        network.command('findadd', 'artist', item.getIn(['artist', 'name']), 'album', item.getIn(['album', 'name']), 'title', item.get('title'));

        break;
    }
  },
  playlistReorderItems(items) {
    const commands = items.map(function(item, i) {
      return {
        command: 'moveid',
        args: [item.id, i]
      };
    });

    network.commands(commands);
  },

  listenerIdentify(name) {
    network.send('identify', name);
  },
};
