var _ = require('underscore');
var Q = require('q');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ListenersModel = function(network) {
    this.network = network;

    this.listeners = [];

    this.network.on('clientslist', function(clients) {
        this.emit('clientslist', clients);
    }.bind(this));
};

util.inherits(ListenersModel, EventEmitter);

_.extend(ListenersModel.prototype, {
    fetchListeners: function() {
        var network = this.network;

        var promise = Q.promise(function(resolve, reject) {
            var handler = function(clients) {
                this.listeners = clients;

                network.off(handler);

                resolve(this.listeners);
            }.bind(this);

            network.on('clientslist', handler);
        }.bind(this));

        this.network.send('clientslist');

        return promise;
    }
});

module.exports = ListenersModel;