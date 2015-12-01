var AbstractParser = require('./abstract_parser.js'),
    _ = require('lodash');

export default class LineParser extends AbstractParser {
  parse(s) {
    if (!s) {
      return s;
    }

    const lines = s.split('\n'),
          json = [];

    _.compact(lines)
      .map(this.parseLine)
      .forEach((o, index) => {
        let obj = {};

        obj[o.key] = o.value;

        json.push(obj);
      });

    return json;
  }
}
