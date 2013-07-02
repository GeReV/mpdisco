(function() {
  var http = require('http'),
      url = require('url'),
      crypto = require('crypto'),
      querystring = require('querystring');
      
  function createHash(s) {
    s = s || '';
    
    return crypto.createHash('md5').update(s.toLowerCase().trim()).digest('hex');
  }

  var gravatar = module.exports = {
    avatar: function (email, options, https) {
      var baseUrl = (https && "https://secure.gravatar.com/") || 'http://www.gravatar.com/';
          queryData = querystring.stringify(options),
          query = (queryData && "?" + queryData) || "";
  
      return baseUrl + 'avatar/' + createHash(email) + query;
    },
    profileUrl: function(email, format, https) {
      var baseUrl = (https && "https://secure.gravatar.com/") || 'http://www.gravatar.com/';
      
      format = format || 'json';
      
      return baseUrl + createHash(email) + '.' + format;
    },
    profile: function(email, https, callback, error) {
      var that = this,
          options = url.parse(gravatar.profileUrl(email, 'json', https)),
          requests = 0,
          maxRequests = 3;
      
      options.method = 'GET';
      options.headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; MPDisco node.js client)'
      };
      
      error = error || function() {};
      
      var req = http.get(options, function followRedirects(res) {
        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
          var location = res.headers.location,
              opts = url.parse(res.headers.location);
              
          if (requests > maxRequests) {
            return;
          }
              
          opts.method = options.method;
          opts.headers = options.headers;
                    
          requests++;
          
          // The location for some (most) redirects will only contain the path,  not the hostname;
          // detect this and add the host to the path.
          if (!opts.hostname) {
            // Hostname not included; get host from requested URL (url.parse()) and prepend to location.
            opts.hostname = options.hostname;
          }
          
          http.get(opts, followRedirects);

        // Otherwise no redirect; capture the response as normal            
        } else {
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
        }
      })
      .on('error', error);
    }
  };
})();
