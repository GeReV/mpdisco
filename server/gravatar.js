(function() {
  var http = require('./helpers/http_follower.js'),
      url = require('url'),
      crypto = require('crypto'),
      querystring = require('querystring');
      
  function createHash(s) {
    s = s || '';
    
    return crypto.createHash('md5').update(s.toLowerCase().trim()).digest('hex');
  }

  var gravatar = module.exports = {
    avatar: function (email, options, https) {
      var baseUrl = (https ? 'https://secure.gravatar.com/' : 'http://www.gravatar.com/'),
          queryData = querystring.stringify(options),
          query = (queryData ? "?" + queryData : "");
  
      return baseUrl + 'avatar/' + createHash(email) + query;
    },
    profileUrl: function(email, format, https) {
      var baseUrl = (https && "https://secure.gravatar.com/") || 'http://www.gravatar.com/';
      
      format = format || 'json';
      
      return baseUrl + createHash(email) + '.' + format;
    },
    profile: function(email, https, callback, error) {
      var that = this,
          options = url.parse(gravatar.profileUrl(email, 'json', https));
      
      options.headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; MPDisco node.js client)'
      };
      
      error = error || function() {};
      
      var req = http.get(options, function(res) {
        var body = '';
        
        res.on('data', function(chunk) {
           body += chunk;
        });
  
        res.on('end', function() {
          
          if (body.indexOf('not found') >= 0) {
            
            // If no profile was found, send the avatar link anyway.
            
            callback({
              displayName: email,
              thumbnailUrl: that.avatar(email)
            });
            
            return;
          }
          
          var json = JSON.parse(body);
          
          callback(json);
        });
      })
      .on('error', error);
    }
  };
})();
