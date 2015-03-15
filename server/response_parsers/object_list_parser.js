var AbstractParser = require('./abstract_parser.js'),
    _ = require('underscore');

var ObjectListParser = AbstractParser.extend({
  init: function(separatorKey) {
    this.separatorKey = separatorKey;
  },
  parse: function(s) {
    var obj = {},
        json = [];

    if (!s) {
      return json;
    }

    s.split('\n').forEach(function(l, index) {
      if (!l) {
        return;
      }

      var o = this.parseLine(l);

      // If we ran into an existing key, it means it's a new record.
      if (o.key === this.separatorKey && index > 0) {
        json.push(obj);

        obj = {};
      }

      obj[o.key] = o.value;
    }, this);

    json.push(obj);

    return json;
  }
});

module.exports = ObjectListParser;
