var
    debug = require('debug')('mpdisco:server'),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    compression = require('compression'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    _ = require('lodash');

import io from 'socket.io/lib/index.js';

var __pwd = path.join(__dirname, '..');

var metadata = require('./meta_data.js');
var upload = require('./file_upload.js');
var ClientsManager = require('./clients_manager.js');

export default class Server {
    static defaults = {
        serverPort: 3000
    };

    constructor(mpd, mode, options) {
        this.options = _.defaults(Server.defaults, options);

        this.mpd = mpd;
        this.mode = mode;

        this.uploadHandler = this._initUploadHandler(this.mpd, this.options.config);

        var sessionStore = session({
            name: this.options.config.session_key,
            secret: this.options.config.secret,
            resave: false,
            saveUninitialized: true
        });

        this.app = express();
        this._initApp(this.app, this.options, sessionStore);

        this.server = http.Server(this.app);

        this.clientsManager = ClientsManager.instance();

        this.socket = io(this.server);
        this._initSocketIO(this.socket, sessionStore, this.clientsManager);
    }

    _initApp(app, options, session) {

        var config = options.config;

        app.use(compression());
        app.use(cookieParser());

        app.use(session);

        app.use(express.static(path.join(__pwd, '/public')));

        app.get('/', function (req, res) {
            res.sendFile(path.join(__pwd, 'server', 'views', 'index.html'));
        });

        app.get('/covers/:artist/:album', function (req, res) {
            var mm = require('./meta_data.js'),
                artist = mm.safeName(req.params.artist),
                album = mm.safeName(req.params.album),
                file = path.join(config.music_directory.replace(/^~/, process.env.HOME), artist, album, 'front.jpg');

            res.sendFile(file, {maxAge: 7 * 24 * 60 * 60 * 1000});
        });

        app.all('/upload', this.uploadHandler);
    }

    start() {
        var options = this.options;
        var port = options.serverPort;

        this.server.listen(port, function () {
          if (process.send) {
            process.send('online');
          } else {
            console.log('MPDisco Server :: Listening on port ' + port);
          }
        });
    }

    _initSocketIO(socket, session, clientsManager) {

        //Socket.io will call this function when a client connects,
        //So we can send that client a unique ID we use so we can
        //maintain the list of players.
        socket.on('connection', function (client) {

            // Embed the session in the client's handshake.
            session(client.handshake, {}, function() {

                clientsManager.connected(client);

                client.on('command', function (cmd) {

                    this.mode.command(cmd.command, cmd.args, client);

                }.bind(this));

                client.on('commands', function (cmds) {

                    this.mode.commands(cmds, client);

                }.bind(this));

            }.bind(this));

        }.bind(this));

        this.mpd.on('system', function (system) {
            socket.sockets.emit('update', system);
            socket.sockets.emit('update:' + system);
        });
    }

    _initUploadHandler(mpd, config) {
        var handler = upload({
            acceptFileTypes: /\.(mp3|ogg|flac|mp4)/i,
            tmpDir: '/tmp',
            uploadPath: function (file, callback) {
                metadata.forFile(file)
                    .then(function(data) {
                        var parts = _.compact([
                            config.music_directory.replace(/^~/, process.env.HOME),

                            metadata.safeName(data.artist.length ? data.artist.join('_') : data.artist),

                            metadata.safeName(data.album)
                        ]);

                        var filename = path.join.apply(this, parts);

                        debug('Saving uploaded file to %s', filename);

                        callback(filename);
                    })
                    .fail(function(err) {
                        console.log(err);
                    });
            }
        });

        handler.on('end', _.debounce(function(result) {
            debug('Updating database...');

            mpd.sendCommand('update');
        }.bind(this), 5000));

        return handler;
    }
}
