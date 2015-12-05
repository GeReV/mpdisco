import AbstractParser from './abstract_parser.js';
import _ from 'lodash';

export default class SimpleParser extends AbstractParser {
  parse(s) {
    if (!s) {
      return s;
    }

    const lines = s.split('\n'),
          obj = {},
          json = [],
          overwrites = 0;

    _.compact(lines)
      .map(this.parseLine)
      .forEach(o => {
        if (obj.hasOwnProperty(o.key) && overwrites >= 2) {
          console.warn('Key overwrite when parsing response (key=' + o.key + '), SimpleParser could be wrong for response. Response:');
          console.warn(s);
        }

        obj[o.key] = o.value;
      });

    json.push(obj);

    return (json.length === 1 ? json[0] : json);
  }
}
