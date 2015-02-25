var exec = require('child_process').exec;

var CommandProcessors = {
  add: function(mpd, args, callback, error) {
    if (!args.length) {
      return;
    }

    var url = args[0];

    if (/^https?:\/\/.*?youtube.com\/watch/.test(url)) {
      exec('youtube-dl -g ' + url, function(error, stdout, stderr) {
        if (!!error) {
          error();

          return;
        }

        var streamUrl = stdout.trim();

        console.log('Retrieved stream url for: ', url);

        callback(streamUrl);
      });
    }
  }
};

module.exports = CommandProcessors;
