var React = require('react/addons');
var Network = require('./network.js');
var _ = require('underscore');

var BasicMode = require('./basic_mode.jsx');
var MasterMode = require('./master_mode.jsx');

var host = window.location.hostname;

var network = new Network(host, 3000);

var MPDisco = MasterMode;

React.render(<MPDisco network={network} />, document.body);