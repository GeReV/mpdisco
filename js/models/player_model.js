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
    }.bind(this));

    this.network.on('coverart', function(res) {
        this.emit('cover', res.url);
    }.bind(this));

    this.network.on('playid', function() {
        this.update();
    }.bind(this));

    this.network.on('update:player', this.update.bind(this));
    this.network.on('repeat', this.update.bind(this));
    this.network.on('random', this.update.bind(this));
};

util.inherits(PlayerModel, EventEmitter);

_.extend(PlayerModel.prototype, {
    update: function() {
        this.network.command('currentsong');
        this.network.command('status');
    },
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
    },
    toggleShuffle: function(random) {
        this.network.command('random', random.toString());
    },
    toggleRepeat: function(repeat, single) {
        this.network.command('repeat', repeat.toString());
        this.network.command('single', single.toString());
    },
    seek: function(id, seconds) {
        this.network.command('seekid', [id.toString(), seconds.toString()]);
    }
});

module.exports = PlayerModel;