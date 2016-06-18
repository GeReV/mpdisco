import reactor from './reactor';
import network from './network';

import {
  ItemTypes
} from './constants';

import {
  RECEIVE_PLAYLIST
} from './action_types';

export function fetchLibraryArtists() {
  network.command('list', 'artist');
}

export function fetchLibraryAlbums(artist) {
  network.command('list', 'album', artist);
}

export function fetchLibrarySongs(artist, album) {
  network.command('find', 'artist', artist, 'album', album);
}

export function fetchStatus() {
  network.command('status');
}

export function fetchCurrentSong() {
  network.command('currentsong');
}

export function fetchListeners() {
  network.send('clientslist');
}

export function fetchPlaylist() {
  network.command('playlistinfo');
}

export function toggleShuffle(random) {
  network.command('random', random);
}

export function toggleRepeat(repeat, single) {
  network.command('repeat', repeat);
  network.command('single', single);
}

export function seek(id, seconds) {
  network.command('seekid', id, seconds);
}

export function play(id) {
  if (id) {
    network.command('playid', id);
  }
  network.command('play');
}

export function stop() {
  network.command('stop');
}

export function pause(state) {
  let p = state;
  if (p === undefined) {
    p = true;
  }
  network.command('pause', (p ? 1 : 0));
}

export function next() {
  network.command('next');
}

export function previous() {
  network.command('previous');
}

export function playlistRemoveItems(items) {
  const commands = items.map(item => ({
    command: 'deleteid',
    args: [item.id]
  }));

  network.commands(commands);
}

export function playlistAddItem(itemType, item) {
  let itm;
  switch (itemType) {
  case ItemTypes.ARTIST:
    itm = item.artist;

    network.command('findadd', 'artist', itm.get('name'));

    break;
  case ItemTypes.ALBUM:
    itm = item.album;

    network.command(
      'findadd',
      'artist',
      itm.getIn(['artist', 'name']),
      'album',
      itm.get('name')
    );

    break;
  case ItemTypes.SONG:
    itm = item.song;

    network.command(
      'findadd',
      'artist',
      itm.getIn(['artist', 'name']),
      'album',
      itm.getIn(['album', 'name']),
      'title',
      itm.get('title')
    );

    break;
  default:
    break;
  }
}

export function playlistReorderItems(items) {
  reactor.dispatch(RECEIVE_PLAYLIST, { playlist: items });

  const commands = items.map((item, i) => ({
    command: 'moveid',
    args: [item.get('id'), i]
  }));

  network.commands(commands);
}

export function listenerIdentify(name) {
  network.send('identify', name);
}
