
var MPDiscoServer = require('./server/server.js');

var mpdisco = new MPDiscoServer();

mpdisco.start(MPDiscoServer.Modes.Basic);
