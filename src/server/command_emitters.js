const debug = require('debug')('mpdisco:command_emitters');
import CoverArt from './cover_art.js';

function log(command, args, response) {
  debug('Emitting: %s %s: %s', command, JSON.stringify(args), JSON.stringify(response));
}

const emitters = {
  list: function emitSpecializedEvent(command, args, response, client) {
    if (args.length) {
      log(command, args, response);

      client.emit(command, response);

      const cmd = command + ':' + args[0].toLowerCase();

      log(cmd, args.slice(1), response);

      client.emit(cmd, {
        args: args.slice(1),
        data: response
      });
    }
  },
  find: function emitCommandWithEverySecondArg(command, args, response, client) {
    if (args.length) {
      log(command, args, response);

      client.emit(command, {
        args: args.filter((v, i) => (i % 2 === 1)),
        data: response
      });
    }
  },
  currentsong: function (command, args, response, client) {
    client.emit(command, response);

    log(command, args, response);

    if (response && response.artist && response.album) {
      CoverArt.getCover({
        artist: response.artist,
        release: response.album
      })
        .then(url => {
          debug('Sending cover: %s', url);

          client.emit('coverart', {
            url: url
          });
        })
        .fail(error => {
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

export default {
  emitters,
  emitterForCommand(command) {
    return emitters[command] || simpleEmitter;
  }
};
