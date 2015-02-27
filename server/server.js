var
    Class = require('clah'),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    compression = require('compression'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    cookie = require('cookie'),
    io = require('socket.io'),
    _ = require('underscore');

var __pwd = path.join(__dirname, '..');

var upload = require('./file_upload.js');
var ClientsManager = require('./clients_manager.js');

var Server = Class.extend({
    defaults: {
        serverPort: 3000
    },
    init: function(mpd, mode, options) {
        this.options = _.defaults(this.defaults, options);

        this.mpd = mpd;
        this.mode = mode;

        this.app = express();
        this._initApp(this.app, this.options);

        this.server = http.Server(this.app);

        this.socket = io(this.server);
        this._initSocketIO(this.socket, this.options.config);

        this.clientsManager = ClientsManager.instance();
    },

    _initApp: function (app, options) {

        var config = options.config;

        app.use(compression());
        app.use(cookieParser());

        app.use(session({
            name: config.session_key,
            secret: config.secret,
            resave: false,
            saveUninitialized: true
        }));

        app.use(express.static(__pwd + '/public'));

        app.get('/', function (req, res) {
            res.sendFile(__pwd + '/views/index.html');
        });

        app.get('/covers/:artist/:album', function (req, res) {
            var mm = require('./meta_data.js'),
                artist = mm.safeName(req.params.artist),
                album = mm.safeName(req.params.album),
                file = path.join(config.music_directory.replace(/^~/, process.env.HOME), artist, album, 'front.jpg');

            res.sendfile(file, {maxAge: 7 * 24 * 60 * 60 * 1000});
        });

        //app.all('/upload', upload.action);

        //upload.options.acceptFileTypes = /\.(mp3|ogg|flac|mp4)/i;
        //upload.uploadPath = function (file, callback) {
        //    var metadata = require('./meta_data.js');
        //
        //    metadata.forFile(file, function (data) {
        //
        //        var parts = _.compact([
        //            config.music_directory.replace(/^~/, process.env.HOME),
        //
        //            metadata.safeName(data.artist.length ? data.artist.join('_') : data.artist),
        //
        //            metadata.safeName(data.album)
        //        ]);
        //
        //        callback(path.join.apply(this, parts));
        //    });
        //};
    },

    start: function() {
        var options = this.options;
        var port = options.serverPort;

        this.server.listen(port, function () {
            console.log('MPDisco Server :: Listening on port ' + port);
        });
    },

    _initSocketIO: function (sio, config) {

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
        sio.sockets.on('connection', function (client) {

            this.clientsManager.connected(client);

            client.on('command', function (cmd) {

                this.mode.command(cmd.command, cmd.args, client);

            }.bind(this));

            client.on('commands', function (cmds) {

                this.mode.commands(cmds, client);

            }.bind(this));

            this.mpd.on('system', function (system) {
                client.emit('update', system);
                client.emit('update:' + system);
            });

        }.bind(this));
    }
});

module.exports = Server;