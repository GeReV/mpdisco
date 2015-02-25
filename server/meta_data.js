var fs = require('fs'),
    mm = require('musicmetadata');

var MetaData = {
  forFile: function(path, callback) {
    var stream = fs.createReadStream(path),
        parser = new mm(stream);

    parser.once('metadata', function(data) {
      stream.destroy();

      callback(data);
    });
  },
  safeName: function(s) {
    if (!s) {
      return s;
    }

    return s
      .trim()
      .replace('&', ' and ')
      .replace(/[^\w\-,\.\s]+/g, '')
      .replace(/\b(\S+?)\b/g, function(s) {
        // Uppercase every word.
        return s.substring(0, 1).toUpperCase() + s.slice(1);
      }).replace(/\b(an?|and|of|the|is|for|to|at|but|by|n?or|so)\b/gi, function(s) {
        // Lower case connection words.
        return s.toLowerCase();
      }).replace(/^(\S+?)\b|\b(\S+?)$/g, function(s) {
        // Uppercase first and last words.
        return s.substring(0, 1).toUpperCase() + s.slice(1);
      })
      .replace(/[,\s\-]+/g, '_');
  }
};

module.exports = MetaData;
