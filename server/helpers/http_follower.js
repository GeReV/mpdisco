var http = require('http'),
    url = require('url');

function get(options, fn, maxRequests) {
  var requests = 0;

  maxRequests = maxRequests || 3;

  return http.get(options, function followRedirects(res) {

    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      var location = res.headers.location,
          opts = url.parse(res.headers.location);

      if (requests > maxRequests) {
        return;
      }

      opts.headers = options.headers;

      requests++;

      // The location for some (most) redirects will only contain the path,  not the hostname;
      // detect this and add the host to the path.
      if (!opts.hostname) {
        // Hostname not included; get host from requested URL (url.parse()) and prepend to location.
        opts.hostname = options.hostname;
      }

      http.get(opts, followRedirects);

    } else {
      fn.apply(this, arguments);
    }

  });
}

module.exports = {
  get: get
};
