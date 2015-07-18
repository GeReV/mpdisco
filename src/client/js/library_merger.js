var _ = require('underscore');

var LibraryMerger = function(network, cursor) {
    this.network = network;
    this.cursor = cursor;

    this.network.on('list:artist', this.handleArtistsResponse.bind(this));

    this.network.on('list:album', this.handleAlbumsResponse.bind(this));

    this.network.on('find', this.handleSongsResponse.bind(this));
};

_.extend(LibraryMerger.prototype, {
    handleArtistsResponse: function(res) {
        // Process the response first.
        var nextArtists = res.data.map(function(item) {
            return { name: item.artist };
        });

        var artists = this.cursor.get();

        this.cursor.edit(this.diffArtists(artists, nextArtists));
    },

    diffArtists: function(currentArtists, nextArtists) {
        var nextArtistNames = nextArtists.map(function(item) {
            return item.name;
        });

        // Remove the artists we do not have in both, we just need to keep the ones we already have.
        // The others were removed.
        var filteredArists = currentArtists.filter(function(item) {
            return nextArtistNames.indexOf(item.name) >= 0;
        });

        // Create a lookup for the artists we save.
        var filteredArtistNames = filteredArists.map(function(item) {
            return item.name;
        });

        // Use the above lookup to keep just the completely new artists
        // (those who are in the next list, but not in the previous).
        var newArtists = nextArtists.filter(function(item) {
            return filteredArtistNames.indexOf(item.name) < 0;
        });

        return _.sortBy(filteredArists.concat(newArtists), function(item) {
          return item.name.replace(/^\s*The\s+/i, ''); // Ignore names starting with "The".
        });
    },

    handleAlbumsResponse: function(res) {
        var artistName = res.args[0];
        var artist = this.cursor.select({ name: artistName });

        if (!artist.get()) {
            return;
        }

        var albums = res.data.map(function(item) {
            return {
                name: item.album,
                artist: artist.get()
            };
        });

        artist.set('albums', albums);
    },

    handleSongsResponse: function(res) {
        var artistName = res.args[0];
        var albumName = res.args[1];

        var album = this.cursor.select({ name: artistName }, 'albums', { name: albumName });

        if (!album.get()) {
            return;
        }

        var songs = res.data.map(function(item) {
            item = _.pick(item, 'time', 'title', 'albumartist', 'track', 'date', 'genre', 'composer');

            return _.extend(item, {
                album: album.get(),
                artist: album.get().artist
            });
        });

        album.set('songs', songs);
    }
});

module.exports = LibraryMerger;