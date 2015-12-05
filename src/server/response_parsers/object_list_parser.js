import AbstractParser from './abstract_parser.js';

export default class ObjectListParser extends AbstractParser {
  constructor(separatorKey) {
    super();

    this.separatorKey = separatorKey;
  }

  parse(s) {
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
}
