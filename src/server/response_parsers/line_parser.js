import AbstractParser from './abstract_parser.js';
import _ from 'lodash';

export default class LineParser extends AbstractParser {
  parse(s) {
    if (!s) {
      return s;
    }

    const lines = s.split('\n');
    const json = [];

    _.compact(lines)
      .map(this.parseLine)
      .forEach(o => {
        let obj = {};

        obj[o.key] = o.value;

        json.push(obj);
      });

    return json;
  }
}
