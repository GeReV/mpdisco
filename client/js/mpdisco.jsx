var React = require('react/addons');
var Network = require('./network.js');
var _ = require('underscore');

var BasicMode = require('./basic_mode.jsx');
var MasterMode = require('./master_mode.jsx');

var MPDiscoModel = require('./mpdisco_model.js');
var MPDiscoController = require('./mpdisco_controller.js');

var host = window.location.hostname;

var network = new Network(host, 3000);

var model = new MPDiscoModel(network);

var controller = new MPDiscoController(network);

var MPDisco = MasterMode;

React.render(<MPDisco controller={controller} network={network} />, document.body);