var port = process.env.PORT || 3000,
    http = require('http'),
    io = require('socket.io'),
    express = require('express'),
    UUID = require('node-uuid'),
    app = express(),
    server = http.createServer(app);

app.use(express.logger());
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.bodyParser());

app.use(express.static(__dirname));

server.listen(port);

console.log('\t :: Express :: Listening on port ' + port);

var sio = io.listen(server),
    clients = {};

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
  client.emit('onconnected', {
    id: client.userid,
    clients: Object.keys(clients)
  });
  
  clients[client.userid] = client;

  //Useful to know when someone connects
  console.log('\t socket.io:: player ' + client.userid + ' connected');

  //When this client disconnects
  client.on('disconnect', function() {

    //Useful to know when someone disconnects
    console.log('\t socket.io:: client disconnected ' + client.userid);
    
    client.broadcast.emit('clientdisconnected', client.userid);
    
    delete clients[client.userid];

  });
  //client.on disconnect
  
  client.on('update', function(msg) {
    
    msg.userid = client.userid;
    
    client.broadcast.emit('update', msg);
  });

});
//sio.sockets.on connection