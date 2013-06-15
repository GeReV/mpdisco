var port = process.env.PORT || 3000,
    http = require('http'),
    io = require('socket.io'),
    express = require('express'),
    engines = require('consolidate'),
    scss = require('node-sass'),
    UUID = require('node-uuid'),
    komponist = require('komponist'),
    app = express(),
    server = http.createServer(app),
    modes = {
      master: require('./server/master_mode.js')
    },
    sio,
    clients = {},
    mode,
    mpd;

/*app.engine('html', engines.handlebars);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');*/

app.use(express.logger());
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.bodyParser());

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

  //tell the player they connected, giving them their id and id's of other clients.
  
  clients[client.userid] = client;
  
  mode.setMaster(client);

  //Useful to know when someone connects
  console.log('\t socket.io:: client ' + client.userid + ' connected');

  //When this client disconnects
  client.on('disconnect', function() {

    //Useful to know when someone disconnects
    console.log('\t socket.io:: client disconnected ' + client.userid);
    
    client.broadcast.emit('clientdisconnected', client.userid);
    
    delete clients[client.userid];

  });
  //client.on disconnect
  
  client.on('command', function(msg) {
    
    mode.command(msg.command, msg.args, client);
    
  });
  
  mpd.on('changed', function(system) {
    client.emit('update', system);
  });
  
  // Let the client know connection was achieved and send status.
  mpd.command('status', null, function(err, status) {
    client.emit('connected', {
      id: client.userid,
      clients: Object.keys(clients),
      mode: mode.type,
      status: status
    });
  });

});
//sio.sockets.on connection

mpd = komponist.createConnection(function() {
  console.log('\t :: MPD :: connection established')
});

mode = new modes.master(mpd, clients);
