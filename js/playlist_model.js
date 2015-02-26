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
    }
});

module.exports = PlaylistModel;