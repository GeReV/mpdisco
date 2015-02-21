var _ = require('underscore');
var Promise = require('promise');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var LibraryModel = function(network) {
    this.network = network;

    this.artists = [];

    this.bindCallbacks();

    this.fetchArtists();
};

util.inherits(LibraryModel, EventEmitter);

_.extend(LibraryModel.prototype, {
    bindCallbacks: function() {
        this.network.on('list:artist', function(res) {
            this.artists = res.data.map(function(item) {
                return { name: item.artist };
            });

            this.emit('artists', this.artists);
        }.bind(this));
    },

    fetchArtists: function() {
        this.network.command('list', 'artist');
    },

    fetchAlbums: function(artist) {
        artist = _.findWhere(this.artists, { name: artist });

        if (!artist) {
            return;
        }

        var network = this.network;

        var promise = new Promise(function(resolve, reject) {
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
        });

        this.network.command('list', ['album', artist.name]);

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

        var promise = new Promise(function(resolve, reject) {
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
        });

        this.network.command('find', ['artist', artist.name, 'album', album.name]);

        return promise;
    }
});

module.exports = LibraryModel;