var _ = require('underscore');
var React = require('react/addons');
var Network = require('./network.js');
var MPDisco = require('./mpdisco.jsx');

_.findIndex = function(obj, iterator, context) {
    var result = -1;
    _.any(obj, function(value, index, list) {
        if(iterator.call(context, value, index, list)) {
            result = index;
            return true;
        }
    });
    return result;
};

var host = window.location.hostname;

MPDisco.network = new Network(host, 3000);

MPDisco.command = MPDisco.network.command.bind(MPDisco.network);

MPDisco.commands = MPDisco.network.commands.bind(MPDisco.network);

window.MPDisco = MPDisco;

React.render(<MPDisco />, document.body);