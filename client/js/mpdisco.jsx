var React = require('react/addons');

var Network = require('./network.js');

var BasicMode = require('./basic_mode.jsx');
var MasterMode = require('./master_mode.jsx');

var MPDiscoModel = require('./mpdisco_model.js');
var MPDiscoController = require('./mpdisco_controller.js');

var network = new Network(window.location.hostname, 3000);

MPDiscoModel.init(network);

var controller = new MPDiscoController(network);

var MPDisco = MasterMode;

React.render(<MPDisco controller={controller} network={network} />, document.body);