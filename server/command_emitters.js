var debug = require('debug')('mpdisco:command_emitters');
var CoverArt = require('./cover_art.js');

function log(command, args, response) {
    debug('Emitting: %s %s: %s', command, JSON.stringify(args), JSON.stringify(response));
}

var specialEmitters = {
    list: function emitSpecializedEvent(command, args, response, client) {
        if (args.length) {
            log(command, args, response)

            client.emit(command, response);

            command = command + ':' + args[0].toLowerCase();

            log(command, args.slice(1), response)

            client.emit(command, {
                args: args.slice(1),
                data: response
            });
        }
    },
    find: function emitCommandWithEverySecondArg(command, args, response, client) {
        if (args.length) {
            log(command, args, response)

            client.emit(command, {
                args: args.filter(function(v, i) { return (i % 2 == 1); }),
                data: response
            });
        }
    },
    currentsong: function(command, args, response, client) {

        client.emit(command, response);

        log(command, args, response)

        if (response && response.artist && response.album) {

            CoverArt
                .getCover({ artist: response.artist, release: response.album })
                .then(function(url) {
                    debug('Sending cover: %s', url);

                    client.emit('coverart', {
                        url: url
                    });
                })
                .fail(function(error) {
                    debug('Cover retrieval failed. %s', error);

                    client.emit('coverart', {
                        url: null
                    });
                });
        }
    }
};

function simpleEmitter(command, args, response, client) {
    log(command, args, response);

    client.emit(command, response);
}

module.exports = {
    emitters: specialEmitters,
    emitterForCommand: function(command) {
        return specialEmitters[command] || simpleEmitter;
    }
};