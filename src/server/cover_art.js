var Class = require('clah'),
    config = require('../../config.json'),
    mm = require('./meta_data.js'),
    http = require('http'),
    httpFollower = require('./helpers/http_follower.js'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    _ = require('underscore');
  
var CoverArt = Class.extend({
  getCover: function(options) {
    var output = this._outputPath(options);

    var promise = Q.promise(function(resolve, reject) {

      var urlName = function(s) {
        return mm.safeName(s).replace(/_/g, '-').toLowerCase();
      };

      var path = '/covers/' + urlName(options.artist) + '/' + urlName(options.release);

      if (fs.existsSync(output)) {
        resolve(path);
      } else {
        this._findRelease(options)
            .then(function(urls) {
                return this._retrieveCover(urls);
              }.bind(this), reject)
            .then(function(url) {
                return this._downloadCover(url, output);
              }.bind(this), reject)
            .done(function() {
                resolve(path);
              }, reject);
      }
    }.bind(this));

    return promise;
  },

  _findRelease: function(options) {
    return Q.promise(function(resolve, reject) {

      var host = 'musicbrainz.org',
          path = '/ws/2/release/?fmt=json&query=',
          query;

      query = _.map(options, function(v, k) { return k + ':"' + v + '"'; })
          .join(' AND ');

      if (!query) {
        reject('Could not form query.');

        return;
      }

      var opts = {
        host: host,
        path: path + encodeURIComponent(query),
        headers: {
          'User-Agent': 'MPDisco/1.0'
        }
      };

      http.get(opts, function(res) {
        var body = '';

        if (res.statusCode != 200) {
          reject('Server responded with status: ' + res.statusCode);

          return;
        }

        res.on('data', function(chunk) {
          body += chunk;
        });

        res.on('end', function() {

          var json = JSON.parse(body);

          var results = this._extractBestGuessReleases(json);

          if (!results) {
            reject('No releases found.');
          }

          var urls = _.map(results, function(result) { return 'http://coverartarchive.org/release/' + result.id + '/front-250'; });

          resolve(urls);

        }.bind(this));

        res.on('error', function(e) {
          reject(e);
        });
      }.bind(this));

    }.bind(this));
  },

  _retrieveCover: function(urls) {
    return Q.promise(function(resolve, reject) {
      function getCover(url) {
        if (urls.length <= 0) {
          reject('No covers found.');

          return;
        }

        http.get(url, function(res) {
          if (res.statusCode === 307 && res.headers.location) {
            resolve(res.headers.location);

            return;
          }

          getCover(urls.shift());
        }.bind(this));
      }

      getCover(urls.shift());
    });
  },

  _downloadCover: function(url, output) {
    var file = fs.createWriteStream(output);

    var promise = Q.promise(function(resolve, reject) {
      httpFollower.get(url, function followRedirects(res) {
        res.pipe(file);

        res.on('end', function() {
          resolve(file);
        });

        file.on('error', reject);

        res.on('error', reject);
      });
    });

    return promise;
  },

  _outputPath: function(options) {

    var output = path.join(config.music_directory.replace(/^~/, process.env.HOME),
        mm.safeName(options.artist),
        mm.safeName(options.release),
        'front.jpg');

    return output;
  },

  _extractBestGuessReleases: function(json) {

    var results = [];

    if (json.count <= 0) {
      return;
    }

    results.concat( _.where(json.releases, { country: 'US' }));

    results.concat(_.where(json.releases, { country: 'XE' }));

    results.concat(_.where(json.releases, { country: 'GB' }));

    return results.concat(_.without(json.releases, results)); // Append the rest and return.

  }
});
  
module.exports = new CoverArt();
