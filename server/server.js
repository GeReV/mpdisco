(function() {
  var 
    path = require('path'),
    _ = require('underscore'),
    http = require('http'),
    connect = require('connect'),
    cookie = require('cookie'),
    io = require('socket.io'),
    express = require('express'),
    engines = require('consolidate'),
    scss = require('node-sass'),
    UUID = require('node-uuid'),
    mpd = require('mpd'),
    commandProcessors = require('./server/command_processors.js'),
    upload = require('./server/file_upload.js');
    
  var MPDisco = Class.extend({
    config: require('./config.json'),
    modes: {
      basic:  require('./server/modes/basic_mode.js'),
      master: require('./server/modes/master_mode.js')
    },
    init: function(options) {
      this.options = _.extend(options, {
        mpdPort: 6600,
        mpdHost: 'localhost',
        serverPort: process.env.PORT || 3000
      });
      
      this.app = express();
      this.server = http.createServer(app);
      
      this.initApp(app);
      
      upload.options.acceptFileTypes = /\.(mp3|ogg|flac|mp4)/i;
      upload.uploadPath = function(file, callback) {
        var metadata = require('./server/meta_data.js');
        
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
      /*app.engine('html', engines.handlebars);
  
      app.set('view engine', 'html');
      app.set('views', __dirname + '/views');*/
      
      //app.use(express.logger());
      app.use(express.compress());
      app.use(express.methodOverride());
      app.use(express.cookieParser());
      app.use(express.session({
        secret: this.config.secret,
        key: this.config.session_key
      }));
      //app.use(express.bodyParser());
      
      app.use(scss.middleware({
        src: __dirname + '/css',
        dest: __dirname + '/public',
        debug: true,
        outputStyle: 'compressed'
      }));
      
      app.use(express.static(__dirname + '/public'));
      
      app.configure(function(){
        var dir     = __dirname + "/public/js/templates"
            output  = __dirname + "/public/js/templates.js",
            hbsPrecompiler = require('handlebars-precompiler');
        
        hbsPrecompiler.watchDir(dir, output, ['handlebars', 'hbs']);
        
        hbsPrecompiler.do({
          templates: [dir],
          output: output,
          fileRegex: /\.handlebars$|\.hbs$/i,
          min: true
        });
        
      });
      
      app.get('/', function (req, res) {
        res.sendfile('views/index.html');
      });
      
      app.get('/covers/:artist/:album', function(req, res) {
        var mm = require('./server/meta_data.js'),
            artist = mm.safeName(req.params.artist),
            album = mm.safeName(req.params.album),
            file = path.join(config.music_directory.replace(/^~/, process.env.HOME), artist, album, 'front.jpg');
            
        res.sendfile(file, { maxAge: 7 * 24 * 60 * 60 * 1000 });
      });
      
      app.all('/upload', upload.action);
    }
    start: function(mode) {
      this.server.listen(this.options.port);
  
      console.log('\t :: Express :: Listening on port ' + this.options.port);
      
      this.socket = io.listen(this.server);
      
      this.startSocketIO(this.socket);
      
      this.mpd = mpd.connect({
        port: this.options.mpdPort,
        host: this.options.mpdHost
      });
      
      this.mpd.on('ready', function() {
        console.log('\t :: MPD :: connection established')
      });
      
      this.mode = new mode(this.mpd, commandProcessors);
    },
    startSocketIO: function(sio) {
      var that = this;
      
      //Configure the socket.io connection settings.
      //See http://socket.io/
      sio.configure(function() {
      
        sio.set('log level', 0);
      
        sio.set('authorization', function(handshakeData, callback) {
          callback(null, true);
          // error first callback style
        });
        
        sio.set('authorization', function (data, accept) {
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
             return accept('No cookie transmitted.', false);
          }
          // accept the incoming connection
          accept(null, true);
        });
      });
      
      //Socket.io will call this function when a client connects,
      //So we can send that client a unique ID we use so we can
      //maintain the list of players.
      sio.sockets.on('connection', function(client) {
        var ClientsManager = require('./server/clients_manager.js')();
        
        ClientsManager.connected(client);
      
        client.on('command', function(cmd) {
          
          mode.command(cmd.command, cmd.args, client);
      
        });
        
        client.on('commands', function(cmds) {
      
          mode.commands(cmds, client);
      
        });
      
        that.mpd.on('system', function(system) {
          client.emit('update', system);
        });
      
      });
      //sio.sockets.on connection
    }
  });
  
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