var ObjectListParser = require('./response_parsers/object_list_parser.js');
var SimpleParser = require('./response_parsers/simple_parser.js');
var LineParser = require('./response_parsers/line_parser.js');

var parsers = {
    'list':         new LineParser(),
    'list:album':   new LineParser(),
    'find':         new ObjectListParser('file'),
    'playlistinfo': new ObjectListParser('file'),
    'simple':       new SimpleParser()
};

module.exports = {
    parsers: parsers,
    parserForCommand: function(command, args) {
        var key = command + ':' + args[0];

        return  parsers[key] ||
            parsers[command] ||
            parsers.simple;
    }
};