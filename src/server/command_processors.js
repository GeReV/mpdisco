var Q = require('q');
var debug = require('debug')('mpdisco:command_processors');
var exec = require('child_process').exec;

var processors = {
  add: function(mpd, args, resolve, reject) {
    if (!args.length) {
      reject('No arguments provided.');
    }

    var url = args[0];

    if (/^https?:\/\/.*?youtube.com\/watch/.test(url)) {
      // Only run if this matches our condition.
      exec('youtube-dl -g ' + url, function(error, stdout, stderr) {

        if (error) {
          reject(error);

          return;
        }

        const streamUrl = stdout.trim();

        debug('Retrieved stream url for YouTube link %s: %s', url, streamUrl);

        resolve(streamUrl);
      });

      return;
    }

    // Just do nothing.
    resolve(args);
  }
};

function createProcessorPromise(mpd, command, args) {
  return Q.promise(function (resolve, reject) {
    var processor = processors[command];

    if (processor) {
      processor(mpd, args, resolve, reject);
    } else {
      // Do nothing.
      resolve(args);
    }
  });
}

module.exports = {
  processorForCommand: createProcessorPromise
};
