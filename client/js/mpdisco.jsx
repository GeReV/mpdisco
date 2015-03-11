var React = require('react/addons');
var Network = require('./network.js');
var _ = require('underscore');

var BasicMode = require('./basic_mode.js');
var MasterMode = require('./master_mode.js');

var host = window.location.hostname;

var network = new Network(host, 3000);

var MPDisco = BasicMode;

React.render(<MPDisco network={network} />, document.body);