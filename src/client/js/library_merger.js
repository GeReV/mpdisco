const _ = require('lodash');

const LibraryMerger = (network, cursor) => {
  this.network = network;
  this.cursor = cursor;

  this.network.on('list:artist', this.handleArtistsResponse.bind(this));

  this.network.on('list:album', this.handleAlbumsResponse.bind(this));

  this.network.on('find', this.handleSongsResponse.bind(this));
};

_.extend(LibraryMerger.prototype, {
  handleArtistsResponse(res) {
    // Process the response first.
    const nextArtists = res.data.map(item => ({ name: item.artist }));

    const artists = this.cursor.get();

    this.cursor.edit(this.diffArtists(artists, nextArtists));
  },

  diffArtists(currentArtists, nextArtists) {
    const nextArtistNames = nextArtists.map(item => item.name);

    // Remove the artists we do not have in both, we just need to keep the ones we already have.
    // The others were removed.
    const filteredArists = currentArtists.filter(item => nextArtistNames.indexOf(item.name) >= 0);

    // Create a lookup for the artists we save.
    const filteredArtistNames = filteredArists.map(item => item.name);

    // Use the above lookup to keep just the completely new artists
    // (those who are in the next list, but not in the previous).
    const newArtists = nextArtists.filter(item => filteredArtistNames.indexOf(item.name) < 0);

    // Ignore names starting with "The".
    return _.sortBy(filteredArists.concat(newArtists), item => item.name.replace(/^\s*The\s+/i, ''));
  },

  handleAlbumsResponse(res) {
    const artistName = res.args[0];
    const artist = this.cursor.select({ name: artistName });

    if (!artist.get()) {
      return;
    }

    const albums = res.data.map(item => {
      return {
        name: item.album,
        artist: artist.get()
      };
    });

    artist.set('albums', albums);
  },

  handleSongsResponse(res) {
    const artistName = res.args[0];
    const albumName = res.args[1];

    const album = this.cursor.select({ name: artistName }, 'albums', { name: albumName });

    if (!album.get()) {
      return;
    }

    const songs = res.data.map(item => {
      const obj = _.pick(item, 'time', 'title', 'albumartist', 'track', 'date', 'genre', 'composer');

      return _.extend(obj, {
        album: album.get(),
        artist: album.get().artist
      });
    });

    album.set('songs', songs);
  }
});

module.exports = LibraryMerger;
