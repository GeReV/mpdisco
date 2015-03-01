var _ = require('underscore');
var Promise = require('promise');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var PlaylistModel = function(network) {
    this.network = network;

    this.network.on('playlistinfo', function(res) {
        this.emit('playlist', res);
    }.bind(this));

    this.network.on('update:playlist', this.update.bind(this));
};

util.inherits(PlaylistModel, EventEmitter);

_.extend(PlaylistModel.prototype, {
    update: function() {
        this.network.command('playlistinfo');
    },

    fetchPlaylist: function() {
        var network = this.network;

        var promise = new Promise(function(resolve, reject) {
            var handler = function(res) {
                network.off(handler);

                resolve(res);
            };
            network.on('playlistinfo', handler);
        });

        network.command('playlistinfo');

        return promise;
    },

    removeItems: function(items) {
        var commands = items.map(function(item) {
            return {
                command: 'deleteid',
                args: [item.id]
            };
        });

        this.network.commands(commands);
    },

    addItem: function(itemType, item) {
        var network = this.network;

        switch (itemType) {
            case 'artist':
                network.command('findadd', 'artist', item.name);
                break;
            case 'album':
                network.command('findadd', 'artist', item.artist.name, 'album', item.name);
                break;
            case 'song':
                network.command('findadd', 'artist', item.artist.name, 'album', item.album.name, 'title', item.title);
                break;
        }
    },

    reorderItems: function(items) {
        var commands = items.map(function(item, i) {
            return {
                command: 'moveid',
                args: [item.id.toString(), i.toString()]
            };
        });

        this.network.commands(commands);
    }
});

module.exports = PlaylistModel;