(function() {
  var 
    Class = require('clah'),
    path = require('path'),
    _ = require('underscore'),
    http = require('http'),
    connect = require('connect'),
    cookie = require('cookie'),
    io = require('socket.io'),
    express = require('express'),
    engines = require('consolidate'),
    UUID = require('node-uuid'),
    mpd = require('mpd'),
    commandProcessors = require('./command_processors.js'),
    upload = require('./file_upload.js');
    
  var __pwd = path.join(__dirname, '..');
    
  var MPDisco = Class.extend({
    config: require('../config.json'),
    init: function(options) {
      var config = this.config;
            
      this.options = _.extend(options || {}, {
        mpdPort: 6600,
        mpdHost: 'localhost',
        serverPort: process.env.PORT || 3000
      });
      
      this.app = express();
      
      this.initApp(this.app);
      
      this.server = http.createServer(this.app);
      
      upload.options.acceptFileTypes = /\.(mp3|ogg|flac|mp4)/i;
      upload.uploadPath = function(file, callback) {
        var metadata = require('./meta_data.js');
        
        metadata.forFile(file, function(data) {
          
          var parts = _.compact([
            config.music_directory.replace(/^~/, process.env.HOME),
        
            metadata.safeName(data.artist.length ? data.artist.join('_') : data.artist),
        
            metadata.safeName(data.album)
          ]);
          
          callback(path.join.apply(this, parts));
        });
      };
    },
    initApp: function(app) {
      var config = this.config;
      
      var bodyParser = require('body-parser');
      var methodOverride = require('method-override');
      var compression = require('compression');
      var cookieParser = require('cookie-parser');
      
      //app.use(express.logger());
      app.use(compression());
      app.use(methodOverride());
      app.use(bodyParser());
      app.use(cookieParser());
      
      app.use(express.session({
        secret: this.config.secret,
        key: this.config.session_key
      }));
      
      app.use(express.static(__pwd + '/public'));
      
      app.get('/', function (req, res) {
        res.sendfile('views/index.html');
      });
      
      app.get('/covers/:artist/:album', function(req, res) {
        var mm = require('./meta_data.js'),
            artist = mm.safeName(req.params.artist),
            album = mm.safeName(req.params.album),
            file = path.join(config.music_directory.replace(/^~/, process.env.HOME), artist, album, 'front.jpg');
            
        res.sendfile(file, { maxAge: 7 * 24 * 60 * 60 * 1000 });
      });
      
      app.all('/upload', upload.action);
    },
    start: function(mode) {
      var port = this.options.serverPort;
      
      this.server.listen(port, function() {
        console.log('\t MPDisco :: Listening on port ' + port);
      });
      
      this.socket = io(this.server);
      
      this.startSocketIO(this.socket);
      
      this.mpd = mpd.connect({
        port: this.options.mpdPort,
        host: this.options.mpdHost
      });
      
      this.mpd.on('ready', function() {
        console.log('\t :: MPD :: connection established');
      });
      
      this.mode = new mode(this.mpd, commandProcessors);
    },
    startSocketIO: function(sio) {
      var that = this,
        config = this.config;
      
      //Configure the socket.io connection settings.
      //See http://socket.io/
      sio.use(function (socket, next) {
        var data = socket.request;
        // check if there's a cookie header
        if (data.headers.cookie) {
            // if there is, parse the cookie
            data.cookie = cookie.parse(decodeURIComponent(data.headers.cookie));
            // note that you will need to use the same key to grad the
            // session id, as you specified in the Express setup.
            data.sessionID = data.cookie[config.session_key];
            data.name = data.cookie['mpdisco.name'];
        } else {
           // if there isn't, turn down the connection with a message
           // and leave the function.
           return next(new Error('No cookie transmitted.'));
        }
        // accept the incoming connection
        next();
      });
      
      //Socket.io will call this function when a client connects,
      //So we can send that client a unique ID we use so we can
      //maintain the list of players.
      sio.sockets.on('connection', function(client) {
        var ClientsManager = require('./clients_manager.js')();
        
        ClientsManager.connected(client);
      
        client.on('command', function(cmd) {
          
          that.mode.command(cmd.command, cmd.args, client);
      
        });
        
        client.on('commands', function(cmds) {
      
          that.mode.commands(cmds, client);
      
        });
      
        that.mpd.on('system', function(system) {
          client.emit('update', system);
        });
      
      });
      //sio.sockets.on connection
    }
  });
  
  MPDisco.Modes = {
    Basic:  require('./modes/basic_mode.js'),
    Master: require('./modes/master_mode.js')
  };
  
  if (this.define && define.amd) {
    // Publish as AMD module
    define(function() {
      return MPDisco;
    });
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = MPDisco;
  }
})();