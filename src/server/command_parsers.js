import ObjectListParser from './response_parsers/object_list_parser.js';
import SimpleParser from './response_parsers/simple_parser.js';
import LineParser from './response_parsers/line_parser.js';

const parsers = {
  list: new LineParser(),
  'list:album': new LineParser(),
  find: new ObjectListParser('file'),
  playlistinfo: new ObjectListParser('file'),
  simple: new SimpleParser()
};

module.exports = {
  parsers: parsers,
  parserForCommand(command, args) {
    const key = command + ':' + args[0];

    return parsers[key] ||
        parsers[command] ||
        parsers.simple;
  }
};
