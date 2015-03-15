var _ = require('underscore');
var Q = require('q');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var LibraryModel = function(network) {
    this.network = network;

    this.artists = [];

    this.network.on('update:update', function() {
        this.emit('updating');
    }.bind(this));

    this.network.on('update:database', function() {
        this.fetchArtists()
            .done(function() {
                this.emit('update', this.artists);
            }.bind(this));
    }.bind(this));
};

util.inherits(LibraryModel, EventEmitter);

_.extend(LibraryModel.prototype, {
    fetchArtists: function() {
        var network = this.network;

        var promise = Q.promise(function(resolve, reject) {
            network.once('list:artist', function(res) {
                this.handleArtistsResponse(res);

                resolve(this.artists);
            }.bind(this));

            network.command('list', 'artist');
        }.bind(this));

        return promise;
    },

    handleArtistsResponse: function(res) {
        // Process the response first.
        var nextArtists = res.data.map(function(item) {
            return { name: item.artist };
        });

        this.artists = this.diffArtists(this.artists, nextArtists);
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

        return filteredArists.concat(newArtists);
    },

    fetchAlbums: function(artist) {
        artist = _.findWhere(this.artists, { name: artist });

        if (!artist) {
            return;
        }

        var network = this.network;

        var promise = Q.promise(function(resolve, reject) {
            var handler = function(res) {
                if (res.args[0] !== artist.name) {
                    return;
                }

                var albums = res.data.map(function(item) {
                    return {
                        name: item.album,
                        artist: artist
                    };
                });

                artist.albums = albums;

                // This request was fulfilled, so we can get rid of it.
                network.off(handler);

                resolve(albums);
            };

            network.on('list:album', handler);

            network.command('list', ['album', artist.name]);
        });

        return promise;
    },

    fetchSongs: function(artist, album) {
        artist = _.findWhere(this.artists, { name: artist });

        if (!artist) {
            return;
        }

        album = _.findWhere(artist.albums, { name: album });

        if (!album) {
            return;
        }

        var network = this.network;

        var promise = Q.promise(function(resolve, reject) {
            var handler = function(res) {
                if (res.args[0] !== artist.name || res.args[1] !== album.name) {
                    return;
                }

                var songs = res.data.map(function(item) {
                    item = _.pick(item, 'time', 'title', 'albumartist', 'track', 'date', 'genre', 'composer');

                    return _.extend(item, {
                        album: album,
                        artist: artist
                    });
                });

                album.songs = songs;

                // This request was fulfilled, so we can get rid of it.
                network.off(handler);

                resolve(songs);
            };

            network.on('find', handler);

            network.command('find', ['artist', artist.name, 'album', album.name]);
        });

        return promise;
    }
});

module.exports = LibraryModel;