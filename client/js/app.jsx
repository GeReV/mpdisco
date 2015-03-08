var React = require('react/addons');
var Network = require('./network.js');
var MPDisco = require('./mpdisco.jsx');
var _ = require('underscore');

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

var network = new Network(host, 3000);

window.MPDisco = MPDisco;

React.render(<MPDisco network={network} />, document.body);