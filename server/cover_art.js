(function() {
  var Class = require('clah'),
      config = require('../config.json'),
      mm = require('./meta_data.js'),
      urllib = require('url'),
      http = require('http'),
      httpFollower = require('./helpers/http_follower.js'),
      path = require('path'),
      fs = require('fs'),
      _ = require('underscore');
  
  var CoverArt = Class.extend({
    findRelease: function(options, callback, error) {
      var that = this,
          baseUrl = 'http://musicbrainz.org/ws/2/release/?fmt=json&query=',
          query;
          
      error = error || function() {};
      
      query = _.map(options, function(v, k) { return k + ':"' + v + '"'; })
        .join(' AND ');
      
      if (!query) {
        return;
      }
      
      http.get(baseUrl + encodeURIComponent(query), function(res) {
        var body = '';
        
        if (res.statusCode != 200) {
          error('Server responded with status: ' + res.statusCode);
          
          return;
        }
          
        res.on('data', function(chunk) {
           body += chunk;
        });
  
        res.on('end', function() {
          
          var json = JSON.parse(body);
          
          json = that._extractBestGuessReleases(json);
          
          if (json) {
            callback(json);
          }else{
            error('No release found.');
          }          
        });
        
        res.on('error', function(e) {
          error(e);
        });
      });
    },
    getCover: function(options, callback, error) {
      var that = this,
          output = that._outputPath(options);
          
      error = error || function() {};
          
      function returnUrl() {
        var urlName = function(s) {
              return mm.safeName(s).replace(/_/g, '-').toLowerCase();
          };
          
        callback('/covers/' + urlName(options.artist) + '/' + urlName(options.release));
      }
          
      function success(results) {
        
        if (!results) {
          error('No releases found.');
        }
        
        var urls = _.map(results, function(result) { return 'http://coverartarchive.org/release/' + result.id + '/front-250'; });
        
        that._retrieveCover.call(that, urls, output, returnUrl, error);
      }
      
      if (fs.existsSync(output)) {
        returnUrl();
      }else{
        this.findRelease(options, success, error);
      }
    },
    _retrieveCover: function(urls, output, callback, error) {
      var that = this,
          index = 0;
      
      function getCover(url) {
        if (index >= urls.length) {
          error('No covers found.');
          
          return;
        }
        
        http.get(url, function(res) {
          if (res.statusCode === 307 && res.headers.location) {
            that._downloadCover(res.headers.location, output, callback, error);
            return;
          }
          
          index++;
          
          getCover( urls[index] );
        });
      }
      
      getCover( urls[0] );
      
    },
    _downloadCover: function(url, output, callback, error) {
      var file = fs.createWriteStream(output);
      
      httpFollower.get(url, function followRedirects(res) {
        res.pipe(file);
          
        res.on('end', function() {
          callback();
        });
        
        file.on('error', error);
        
        res.on('error', error);
      });
    },
    _outputPath: function(options) {
      
      var output = path.join(config.music_directory.replace(/^~/, process.env.HOME), mm.safeName(options.artist), mm.safeName(options.release), 'front.jpg');
      
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
})();
