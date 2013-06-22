var port = process.env.PORT || 3000,
    path = require('path'),
    _ = require('underscore'),
    http = require('http'),
    io = require('socket.io'),
    express = require('express'),
    engines = require('consolidate'),
    scss = require('node-sass'),
    UUID = require('node-uuid'),
    mpd = require('mpd'),
    mpdClient = mpd.connect({
        port: 6600,
        host: 'localhost'
    }),
    app = express(),
    server = http.createServer(app),
    config = require('./config.json'),
    commandProcessors = require('./server/command_processors.js'),
    modes = {
      basic:  require('./server/basic_mode.js'),
      master: require('./server/master_mode.js')
    },
    upload = require('./server/file_upload.js'),
    metadata = require('./server/meta_data.js'),
    sio,
    mode;

/*app.engine('html', engines.handlebars);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');*/

app.use(express.logger());
app.use(express.compress());
app.use(express.methodOverride());
//app.use(express.bodyParser());

app.use(scss.middleware({
  src: __dirname + '/css',
  dest: __dirname + '/public',
  debug: true,
  outputStyle: 'compressed'
}));

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile('views/index.html');
});

app.all('/upload', upload.action);

server.listen(port);

console.log('\t :: Express :: Listening on port ' + port);

sio = io.listen(server);

//Configure the socket.io connection settings.
//See http://socket.io/
sio.configure(function() {

  sio.set('log level', 0);

  sio.set('authorization', function(handshakeData, callback) {
    callback(null, true);
    // error first callback style
  });
});
//Socket.io will call this function when a client connects,
//So we can send that client a unique ID we use so we can
//maintain the list of players.
sio.sockets.on('connection', function(client) {

  //Generate a new UUID, looks something like
  //5b2ca132-64bd-4513-99da-90e838ca47d1
  //and store this on their socket/connection
  client.userid = UUID();

  client.broadcast.emit('clientconnected', client.userid);

  //Useful to know when someone connects
  console.log('\t socket.io:: client ' + client.userid + ' connected');

  //When this client disconnects
  client.on('disconnect', function() {

    //Useful to know when someone disconnects
    console.log('\t socket.io:: client disconnected ' + client.userid);

    client.broadcast.emit('clientdisconnected', client.userid);

    mode.disconnected(client);

  });
  //client.on disconnect

  client.on('command', function(cmd) {

    mode.command(cmd.command, cmd.args, client);

  });
  
  client.on('commands', function(cmds) {

    mode.commands(cmds, client);

  });

  mpdClient.on('system', function(system) {
    client.emit('update', system);
  });

  // Let the client know connection was achieved and send status.
  mode.connected(client);

});
//sio.sockets.on connection

mpdClient.on('ready', function() {
  console.log('\t :: MPD :: connection established')
});

mode = new modes.master(mpdClient, commandProcessors);

upload.options.acceptFileTypes = /\.(mp3|ogg|flac|mp4)/i;
upload.uploadPath = function(file, callback) {
  metadata.forFile(file, function(data) {
    
    var parts = _.compact([
      config.music_directory.replace(/^~/, process.env.HOME),
  
      metadata.safeName(data.artist.length ? data.artist.join('_') : data.artist),
  
      metadata.safeName(data.album)
    ]);
    
    callback(path.join.apply(this, parts));
  });
};