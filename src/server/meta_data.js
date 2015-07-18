import Promise from 'bluebird';
import fs from 'fs';
import mm from 'musicmetadata';

var MetaData = {
  forFile: function(path) {
    return new Promise(function(resolve, reject) {
      var stream = fs.createReadStream(path);

      var parser = new mm(stream, function(err, metadata) {
        stream.destroy();

        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
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
