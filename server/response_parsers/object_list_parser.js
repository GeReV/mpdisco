var AbstractParser = require('./abstract_parser.js'),
    _ = require('underscore');

var ObjectListParser = AbstractParser.extend({
  init: function(separatorKey) {
    this.separatorKey = separatorKey;
  },
  parse: function(s) {
    if (!s) {
      return s;
    }

    var that = this,
        lines = s.split('\n'),
        obj = {},
        json = [];

    _(lines).chain().compact().each(function(l, index) {
      var o = that.parseLine(l);

      // If we ran into an existing key, it means it's a new record.
      if (o.key == that.separatorKey && index > 0) {
        json.push(obj);

        obj = {};
      }

      obj[o.key] = o.value;
    });

    json.push(obj);

    return (json.length == 1 ? json[0] : json);
  }
});

module.exports = ObjectListParser;
