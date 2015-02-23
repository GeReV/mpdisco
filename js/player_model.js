var _ = require('underscore');
var Promise = require('promise');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var PlayerModel = function(network) {
    this.network = network;

    this.network.on('status', function(state) {
        this.emit('state', state);
    }.bind(this));

    this.network.on('currentsong', function(song) {
        this.emit('song', song);
    });

    this.network.command('currentsong');
};

util.inherits(PlayerModel, EventEmitter);

_.extend(PlayerModel.prototype, {
    fetchSong: function() {
        var network = this.network;

        var promise = new Promise(function(resolve, reject) {
            var handler = function(res) {
                network.off(handler);

                resolve(res);
            };

            network.on('currentsong', handler);
        });

        network.command('currentsong');

        return promise;
    }
});

module.exports = PlayerModel;