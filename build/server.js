require("source-map-support").install();
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  var MPDiscoApp = __webpack_require__(1);
  
  var mpdisco = new MPDiscoApp(MPDiscoApp.Modes.Master);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
      value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  var _path = __webpack_require__(2);
  
  var _path2 = _interopRequireDefault(_path);
  
  var _lodash = __webpack_require__(3);
  
  var _lodash2 = _interopRequireDefault(_lodash);
  
  var _mpd = __webpack_require__(4);
  
  var _mpd2 = _interopRequireDefault(_mpd);
  
  var _serverJs = __webpack_require__(5);
  
  var _serverJs2 = _interopRequireDefault(_serverJs);
  
  var MPDisco = function MPDisco(mode, options) {
      _classCallCheck(this, MPDisco);
  
      this.options = _lodash2['default'].defaults({
          mpdPort: 6600,
          mpdHost: 'localhost',
          serverPort: process.env.PORT,
          config: __webpack_require__(30)
      }, options);
  
      this.mpd = _mpd2['default'].connect({
          port: this.options.mpdPort,
          host: this.options.mpdHost
      });
  
      this.mpd.on('ready', function () {
          console.log('MPDisco Server :: MPD :: connection established');
      });
  
      this.mode = mode.create(this.mpd);
  
      this.server = new _serverJs2['default'](this.mpd, this.mode, this.options);
      this.server.start();
  };
  
  exports['default'] = MPDisco;
  
  MPDisco.Modes = {
      Basic: __webpack_require__(31),
      Master: __webpack_require__(42)
  };
  module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

  module.exports = require("path");

/***/ },
/* 3 */
/***/ function(module, exports) {

  module.exports = require("lodash");

/***/ },
/* 4 */
/***/ function(module, exports) {

  module.exports = require("mpd");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
      value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  var _socketIoLibIndexJs = __webpack_require__(6);
  
  var _socketIoLibIndexJs2 = _interopRequireDefault(_socketIoLibIndexJs);
  
  var debug = __webpack_require__(7)('mpdisco:server'),
      path = __webpack_require__(2),
      http = __webpack_require__(8),
      express = __webpack_require__(9),
      compression = __webpack_require__(10),
      cookieParser = __webpack_require__(11),
      session = __webpack_require__(12),
      _ = __webpack_require__(3);
  
  var __pwd = path.join(__dirname, '..');
  
  var metadata = __webpack_require__(13);
  var upload = __webpack_require__(17);
  var ClientsManager = __webpack_require__(23);
  
  var Server = (function () {
      _createClass(Server, null, [{
          key: 'defaults',
          value: {
              serverPort: 3000
          },
          enumerable: true
      }]);
  
      function Server(mpd, mode, options) {
          _classCallCheck(this, Server);
  
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
  
          this.socket = (0, _socketIoLibIndexJs2['default'])(this.server);
          this._initSocketIO(this.socket, sessionStore, this.clientsManager);
      }
  
      _createClass(Server, [{
          key: '_initApp',
          value: function _initApp(app, options, session) {
  
              var config = options.config;
  
              app.use(compression());
              app.use(cookieParser());
  
              app.use(session);
  
              app.use(express['static'](path.join(__pwd, '/public')));
  
              app.get('/', function (req, res) {
                  res.sendFile(path.join(__pwd, 'server', 'views', 'index.html'));
              });
  
              app.get('/covers/:artist/:album', function (req, res) {
                  var mm = __webpack_require__(13),
                      artist = mm.safeName(req.params.artist),
                      album = mm.safeName(req.params.album),
                      file = path.join(config.music_directory.replace(/^~/, process.env.HOME), artist, album, 'front.jpg');
  
                  res.sendFile(file, { maxAge: 7 * 24 * 60 * 60 * 1000 });
              });
  
              app.all('/upload', this.uploadHandler);
          }
      }, {
          key: 'start',
          value: function start() {
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
      }, {
          key: '_initSocketIO',
          value: function _initSocketIO(socket, session, clientsManager) {
  
              //Socket.io will call this function when a client connects,
              //So we can send that client a unique ID we use so we can
              //maintain the list of players.
              socket.on('connection', (function (client) {
  
                  // Embed the session in the client's handshake.
                  session(client.handshake, {}, (function () {
  
                      clientsManager.connected(client);
  
                      client.on('command', (function (cmd) {
  
                          this.mode.command(cmd.command, cmd.args, client);
                      }).bind(this));
  
                      client.on('commands', (function (cmds) {
  
                          this.mode.commands(cmds, client);
                      }).bind(this));
                  }).bind(this));
              }).bind(this));
  
              this.mpd.on('system', function (system) {
                  socket.sockets.emit('update', system);
                  socket.sockets.emit('update:' + system);
              });
          }
      }, {
          key: '_initUploadHandler',
          value: function _initUploadHandler(mpd, config) {
              var handler = upload({
                  acceptFileTypes: /\.(mp3|ogg|flac|mp4)/i,
                  tmpDir: '/tmp',
                  uploadPath: function uploadPath(file, callback) {
                      metadata.forFile(file).then(function (data) {
                          var parts = _.compact([config.music_directory.replace(/^~/, process.env.HOME), metadata.safeName(data.artist.length ? data.artist.join('_') : data.artist), metadata.safeName(data.album)]);
  
                          var filename = path.join.apply(this, parts);
  
                          debug('Saving uploaded file to %s', filename);
  
                          callback(filename);
                      }).fail(function (err) {
                          console.log(err);
                      });
                  }
              });
  
              handler.on('end', _.debounce((function (result) {
                  debug('Updating database...');
  
                  mpd.sendCommand('update');
              }).bind(this), 5000));
  
              return handler;
          }
      }]);
  
      return Server;
  })();
  
  exports['default'] = Server;
  module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports) {

  module.exports = require("socket.io/lib/index.js");

/***/ },
/* 7 */
/***/ function(module, exports) {

  module.exports = require("debug");

/***/ },
/* 8 */
/***/ function(module, exports) {

  module.exports = require("http");

/***/ },
/* 9 */
/***/ function(module, exports) {

  module.exports = require("express");

/***/ },
/* 10 */
/***/ function(module, exports) {

  module.exports = require("compression");

/***/ },
/* 11 */
/***/ function(module, exports) {

  module.exports = require("cookie-parser");

/***/ },
/* 12 */
/***/ function(module, exports) {

  module.exports = require("express-session");

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _bluebird = __webpack_require__(14);
  
  var _bluebird2 = _interopRequireDefault(_bluebird);
  
  var _fs = __webpack_require__(15);
  
  var _fs2 = _interopRequireDefault(_fs);
  
  var _musicmetadata = __webpack_require__(16);
  
  var _musicmetadata2 = _interopRequireDefault(_musicmetadata);
  
  var MetaData = {
    forFile: function forFile(path) {
      return new _bluebird2['default'](function (resolve, reject) {
        var stream = _fs2['default'].createReadStream(path);
  
        var parser = new _musicmetadata2['default'](stream, function (err, metadata) {
          stream.destroy();
  
          if (err) {
            reject(err);
          } else {
            resolve(metadata);
          }
        });
      });
    },
    safeName: function safeName(s) {
      if (!s) {
        return s;
      }
  
      return s.trim().replace('&', ' and ').replace(/[^\w\-,\.\s]+/g, '').replace(/\b(\S+?)\b/g, function (s) {
        // Uppercase every word.
        return s.substring(0, 1).toUpperCase() + s.slice(1);
      }).replace(/\b(an?|and|of|the|is|for|to|at|but|by|n?or|so)\b/gi, function (s) {
        // Lower case connection words.
        return s.toLowerCase();
      }).replace(/^(\S+?)\b|\b(\S+?)$/g, function (s) {
        // Uppercase first and last words.
        return s.substring(0, 1).toUpperCase() + s.slice(1);
      }).replace(/[,\s\-]+/g, '_');
    }
  };
  
  module.exports = MetaData;

/***/ },
/* 14 */
/***/ function(module, exports) {

  module.exports = require("bluebird");

/***/ },
/* 15 */
/***/ function(module, exports) {

  module.exports = require("fs");

/***/ },
/* 16 */
/***/ function(module, exports) {

  module.exports = require("musicmetadata");

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

  /*
   * jQuery File Upload Plugin Node.js Example 2.0.3
   * https://github.com/blueimp/jQuery-File-Upload
   *
   * Copyright 2012, Sebastian Tschan
   * https://blueimp.net
   *
   * Licensed under the MIT license:
   * http://www.opensource.org/licenses/MIT
   */
  
  /*jslint nomen: true, regexp: true, unparam: true, stupid: true */
  /*global require, __dirname, unescape, console */
  
  'use strict';
  
  var path = __webpack_require__(2),
      fs = __webpack_require__(15),
      mkdirp = __webpack_require__(18),
      util = __webpack_require__(19),
      _ = __webpack_require__(20),
      EventEmitter = __webpack_require__(21).EventEmitter,
      formidable = __webpack_require__(22),
      options,
      defaults = {
      tmpDir: __dirname + '/../tmp',
      publicDir: __dirname + '/../public',
      uploadDir: __dirname + '/../public/files',
      uploadUrl: '/files/',
      maxPostSize: 11000000000, // 11 GB
      minFileSize: 1,
      maxFileSize: 10000000000, // 10 GB
      acceptFileTypes: /.+/i,
      // Files not matched by this regular expression force a download dialog,
      // to prevent executing any scripts in the context of the service domain:
      safeFileTypes: /\.(gif|jpe?g|png)$/i,
      accessControl: {
          allowOrigin: '*',
          allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
          allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
      },
      uploadPath: function uploadPath(filePath, callback) {
          callback(options.uploadDir);
      }
      /* Uncomment and edit this section to provide the service via HTTPS:
      ssl: {
          key: fs.readFileSync('/Applications/XAMPP/etc/ssl.key/server.key'),
          cert: fs.readFileSync('/Applications/XAMPP/etc/ssl.crt/server.crt')
      },
      */
  },
      utf8encode = function utf8encode(str) {
      return unescape(encodeURIComponent(str));
  },
      nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
      nameCountFunc = function nameCountFunc(s, index, ext) {
      return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
  },
      FileInfo = function FileInfo(file) {
      this.name = file.name;
      this.size = file.size;
      this.type = file.type;
      this.delete_type = 'DELETE';
  },
      UploadHandler = function UploadHandler(req, res, callback) {
      this.req = req;
      this.res = res;
      this.callback = callback;
  };
  
  FileInfo.prototype.validate = function () {
      if (options.minFileSize && options.minFileSize > this.size) {
          this.error = 'File is too small';
      } else if (options.maxFileSize && options.maxFileSize < this.size) {
          this.error = 'File is too big';
      } else if (!options.acceptFileTypes.test(this.name)) {
          this.error = 'Filetype not allowed';
      }
      return !this.error;
  };
  FileInfo.prototype.safeName = function () {
      // Prevent directory traversal and creating hidden system files:
      this.name = path.basename(this.name).replace(/^\.+/, '');
      // Prevent overwriting existing files:
      while (fs.existsSync(options.uploadDir + '/' + this.name)) {
          this.name = this.name.replace(nameCountRegexp, nameCountFunc);
      }
  };
  FileInfo.prototype.initUrls = function (req) {
      if (!this.error) {
          var baseUrl = (options.ssl ? 'https:' : 'http:') + '//' + req.headers.host + options.uploadUrl;
          this.url = this.delete_url = baseUrl + encodeURIComponent(this.name);
      }
  };
  
  UploadHandler.prototype.get = function () {
      var handler = this,
          files = [];
      fs.readdir(options.uploadDir, function (err, list) {
          list.forEach(function (name) {
              var stats = fs.statSync(options.uploadDir + '/' + name),
                  fileInfo;
              if (stats.isFile() && name[0] !== '.') {
                  fileInfo = new FileInfo({
                      name: name,
                      size: stats.size
                  });
                  fileInfo.initUrls(handler.req);
                  files.push(fileInfo);
              }
          });
          handler.callback({ files: files });
      });
  };
  
  UploadHandler.prototype.post = function () {
      var handler = this,
          form = new formidable.IncomingForm(),
          tmpFiles = [],
          files = [],
          map = {},
          counter = 1,
          redirect,
          finish = function finish() {
          counter -= 1;
          if (!counter) {
              files.forEach(function (fileInfo) {
                  fileInfo.initUrls(handler.req);
              });
              handler.callback({ files: files }, redirect);
          }
      };
      form.uploadDir = options.tmpDir;
      form.on('fileBegin', function (name, file) {
          tmpFiles.push(file.path);
          var fileInfo = new FileInfo(file, handler.req, true);
          fileInfo.safeName();
          map[path.basename(file.path)] = fileInfo;
          files.push(fileInfo);
      }).on('field', function (name, value) {
          if (name === 'redirect') {
              redirect = value;
          }
      }).on('file', function (name, file) {
          var fileInfo = map[path.basename(file.path)];
  
          fileInfo.size = file.size;
          if (!fileInfo.validate()) {
              fs.unlink(file.path);
              return;
          }
  
          options.uploadPath(file.path, function (uploadPath) {
  
              mkdirp.sync(uploadPath);
  
              fs.renameSync(file.path, path.join(uploadPath, fileInfo.name));
          });
      }).on('aborted', function () {
          tmpFiles.forEach(function (file) {
              fs.unlink(file);
          });
      }).on('error', function (e) {
          console.log(e);
      }).on('progress', function (bytesReceived, bytesExpected) {
          if (bytesReceived > options.maxPostSize) {
              handler.req.connection.destroy();
          }
      }).on('end', finish).parse(handler.req);
  };
  UploadHandler.prototype.destroy = function () {
      var handler = this,
          fileName;
      if (handler.req.url.slice(0, options.uploadUrl.length) === options.uploadUrl) {
          fileName = path.basename(decodeURIComponent(handler.req.url));
          if (fileName[0] !== '.') {
              fs.unlink(options.uploadDir + '/' + fileName, function (ex) {
                  handler.callback({ success: !ex });
              });
              return;
          }
      }
      handler.callback({ success: false });
  };
  
  var FileUpload = function FileUpload(opts) {
  
      options = _.defaults(opts, defaults);
  
      var events = new EventEmitter();
  
      var fn = function fn(req, res) {
          res.setHeader('Access-Control-Allow-Origin', options.accessControl.allowOrigin);
          res.setHeader('Access-Control-Allow-Methods', options.accessControl.allowMethods);
          res.setHeader('Access-Control-Allow-Headers', options.accessControl.allowHeaders);
  
          var handleResult = (function (result, redirect) {
              if (redirect) {
                  res.writeHead(302, {
                      'Location': redirect.replace(/%s/, encodeURIComponent(JSON.stringify(result)))
                  });
                  res.end();
              } else {
                  res.writeHead(200, {
                      'Content-Type': req.headers.accept.indexOf('application/json') !== -1 ? 'application/json' : 'text/plain'
                  });
                  res.end(JSON.stringify(result));
              }
  
              events.emit('end', result);
          }).bind(this);
  
          var setNoCacheHeaders = function setNoCacheHeaders() {
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
              res.setHeader('Content-Disposition', 'inline; filename="files.json"');
          };
  
          var handler = new UploadHandler(req, res, handleResult);
  
          switch (req.method) {
              case 'OPTIONS':
                  res.end();
                  break;
              case 'HEAD':
              case 'GET':
                  if (req.url === '/') {
                      setNoCacheHeaders();
                      if (req.method === 'GET') {
                          handler.get();
                      } else {
                          res.end();
                      }
                  } else {
                      fileServer.serve(req, res);
                  }
                  break;
              case 'POST':
                  setNoCacheHeaders();
                  handler.post();
                  break;
              case 'DELETE':
                  handler.destroy();
                  break;
              default:
                  res.statusCode = 405;
                  res.end();
          }
      };
  
      _.extend(fn, {
          on: events.on.bind(events)
      });
  
      return fn;
  };
  
  FileUpload.defaults = defaults;
  
  module.exports = FileUpload;

/***/ },
/* 18 */
/***/ function(module, exports) {

  module.exports = require("mkdirp");

/***/ },
/* 19 */
/***/ function(module, exports) {

  module.exports = require("util");

/***/ },
/* 20 */
/***/ function(module, exports) {

  module.exports = require("underscore");

/***/ },
/* 21 */
/***/ function(module, exports) {

  module.exports = require("events");

/***/ },
/* 22 */
/***/ function(module, exports) {

  module.exports = require("formidable");

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  var EventEmitter = __webpack_require__(21).EventEmitter,
      debug = __webpack_require__(7)('mpdisco:clients_manager'),
      uuid = __webpack_require__(24),
      util = __webpack_require__(19),
      _ = __webpack_require__(3);
  
  var Gravatar = __webpack_require__(25);
  
  var EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  
  _.findIndex = function (obj, iterator, context) {
    var result = -1;
    _.any(obj, function (value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = index;
        return true;
      }
    });
    return result;
  };
  
  var ClientsManager = (function (_EventEmitter) {
    _inherits(ClientsManager, _EventEmitter);
  
    function ClientsManager() {
      _classCallCheck(this, ClientsManager);
  
      _get(Object.getPrototypeOf(ClientsManager.prototype), 'constructor', this).call(this);
  
      this.loggedClients = [];
  
      this.clientsHash = {};
  
      this.disconnectionTimeouts = {};
    }
  
    _createClass(ClientsManager, [{
      key: 'connected',
      value: function connected(client) {
        var session = client.handshake.session;
  
        if (!session.userid) {
          session.userid = uuid.v4();
          session.save();
        }
  
        var info = client.info = {
          userid: client.handshake.session.userid
        };
  
        var prevClient = this.clientsHash[info.userid];
  
        //Useful to know when someone connects
        debug('Client connected: %s', info.userid);
  
        if (prevClient) {
          client.info = prevClient.info;
  
          debug('Client returned: %s', info.userid);
        }
  
        this.clientsHash[info.userid] = client;
  
        if (this.disconnectionTimeouts[info.userid]) {
          clearTimeout(this.disconnectionTimeouts[info.userid]);
        }
  
        //When this client disconnects
        client.on('disconnect', (function () {
          this.disconnected(client);
        }).bind(this));
  
        client.on('identify', (function (name) {
          this.performIdentification(client, name);
        }).bind(this));
  
        client.on('clientslist', (function () {
          this.sendClientsList(client);
        }).bind(this));
  
        if (client.handshake.name) {
          this.performIdentification(client, client.handshake.name);
        }
  
        this.emit('connected', client);
      }
    }, {
      key: 'disconnected',
      value: function disconnected(client) {
  
        var info = client.info;
  
        debug('Client disconnected: %s', info.userid);
  
        debug('Client has 5 seconds to return before dropping...');
  
        this.disconnectionTimeouts[info.userid] = setTimeout((function () {
  
          this.dropClient(client);
  
          client.broadcast.emit('clientdisconnected', info /*, this.clientsInfo*/);
  
          this.emit('disconnected', client);
        }).bind(this), 5000);
      }
    }, {
      key: 'dropClient',
      value: function dropClient(client) {
        var info = client.info;
  
        debug('Dropped client: %s', info.userid);
  
        this.loggedClients = _.reject(this.loggedClients, function (c) {
          return c.info.userid === info.userid;
        });
  
        delete this.clientsHash[info.userid];
      }
    }, {
      key: 'performIdentification',
      value: function performIdentification(client, name) {
        if (!name) {
          return;
        }
  
        if (EMAIL_REGEX.test(name.trim())) {
          Gravatar.profile(name, false, (function (profile) {
            this.identifyClient(client, profile);
          }).bind(this));
        } else {
          this.identifyClient(client, {
            displayName: name
          });
        }
      }
    }, {
      key: 'identifyClient',
      value: function identifyClient(client, profile) {
        // TODO: Changing logic so that the client queue contains only identified clients might have broken something. Requires testing.
        var index;
  
        if (profile.entry && profile.entry.length) {
          profile = profile.entry[0];
        }
  
        client.info = _.extend({ logged: true }, client.info, profile);
  
        index = _.findIndex(this.loggedClients, function (c) {
          return c.info.userid === client.info.userid;
        });
  
        if (index >= 0) {
          this.loggedClients[index] = client;
        } else {
          this.loggedClients.push(client);
        }
  
        debug('Client %s identified as %s.', client.info.userid, client.info.displayName);
  
        client.emit('identify', client.info);
        client.broadcast.emit('clientidentified', client.info /*, this.clientsInfo*/);
  
        this.sendClientsList(client.broadcast);
        this.sendClientsList(client);
  
        this.emit('identified', client);
      }
    }, {
      key: 'sendClientsList',
      value: function sendClientsList(client) {
        client.emit('clientslist', this.clientsInfo(), client.info);
      }
    }, {
      key: 'get',
      value: function get(userid) {
        return this.clientsHash[userid];
      }
    }, {
      key: 'first',
      value: function first() {
        if (this.loggedClients.length) {
          return this.loggedClients[0];
        }
      }
    }, {
      key: 'rotate',
      value: function rotate() {
        this.loggedClients.push(this.loggedClients.shift());
      }
    }, {
      key: 'isEmpty',
      value: function isEmpty() {
        return this.loggedClients.length <= 0;
      }
    }, {
      key: 'clientsInfo',
      value: function clientsInfo() {
        return _.map(this.clientsHash, function (v) {
          return v.info;
        }) || [];
      }
    }]);
  
    return ClientsManager;
  })(EventEmitter);
  
  var ClientsManagerSingleton = function ClientsManagerSingleton() {
    if (ClientsManagerSingleton.prototype._singletonInstance) {
      return ClientsManagerSingleton.prototype._singletonInstance;
    }
  
    ClientsManagerSingleton.prototype._singletonInstance = new ClientsManager();
  
    return ClientsManagerSingleton.prototype._singletonInstance;
  };
  
  module.exports = {
    instance: ClientsManagerSingleton
  };

/***/ },
/* 24 */
/***/ function(module, exports) {

  module.exports = require("node-uuid");

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  var http = __webpack_require__(26),
      url = __webpack_require__(27),
      crypto = __webpack_require__(28),
      querystring = __webpack_require__(29);
  
  function createHash(s) {
    s = s || '';
  
    return crypto.createHash('md5').update(s.toLowerCase().trim()).digest('hex');
  }
  
  var Gravatar = {
    avatar: function avatar(email, options, https) {
      var baseUrl = https ? 'https://secure.gravatar.com/' : 'http://www.gravatar.com/',
          queryData = querystring.stringify(options),
          query = queryData ? "?" + queryData : "";
  
      return baseUrl + 'avatar/' + createHash(email) + query;
    },
    profileUrl: function profileUrl(email, format, https) {
      var baseUrl = https && "https://secure.gravatar.com/" || 'http://www.gravatar.com/';
  
      format = format || 'json';
  
      return baseUrl + createHash(email) + '.' + format;
    },
    profile: function profile(email, https, callback, error) {
      var that = this,
          options = url.parse(Gravatar.profileUrl(email, 'json', https));
  
      options.headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; MPDisco node.js client)'
      };
  
      error = error || function () {};
  
      var req = http.get(options, function (res) {
        var body = '';
  
        res.on('data', function (chunk) {
          body += chunk;
        });
  
        res.on('end', function () {
  
          if (body.indexOf('not found') >= 0) {
  
            // If no profile was found, send the avatar link anyway.
  
            callback({
              displayName: email,
              thumbnailUrl: that.avatar(email)
            });
  
            return;
          }
  
          var json = JSON.parse(body);
  
          callback(json);
        });
      }).on('error', error);
    }
  };
  
  module.exports = Gravatar;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  var http = __webpack_require__(8),
      url = __webpack_require__(27);
  
  function get(options, fn, maxRequests) {
    var requests = 0;
  
    maxRequests = maxRequests || 3;
  
    return http.get(options, function followRedirects(res) {
  
      if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
        var location = res.headers.location,
            opts = url.parse(res.headers.location);
  
        if (requests > maxRequests) {
          return;
        }
  
        opts.headers = options.headers;
  
        requests++;
  
        // The location for some (most) redirects will only contain the path,  not the hostname;
        // detect this and add the host to the path.
        if (!opts.hostname) {
          // Hostname not included; get host from requested URL (url.parse()) and prepend to location.
          opts.hostname = options.hostname;
        }
  
        http.get(opts, followRedirects);
      } else {
        fn.apply(this, arguments);
      }
    });
  }
  
  module.exports = {
    get: get
  };

/***/ },
/* 27 */
/***/ function(module, exports) {

  module.exports = require("url");

/***/ },
/* 28 */
/***/ function(module, exports) {

  module.exports = require("crypto");

/***/ },
/* 29 */
/***/ function(module, exports) {

  module.exports = require("querystring");

/***/ },
/* 30 */
/***/ function(module, exports) {

  module.exports = {
  	"music_directory": "~/Music",
  	"secret": "secret",
  	"session_key": "mpdisco.sid",
  	"master_time": 60
  };

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  var debug = __webpack_require__(7)('mpdisco:mode'),
      mpd = __webpack_require__(4),
      mpdcmd = mpd.cmd,
      _ = __webpack_require__(20),
      ClientsManager = __webpack_require__(23),
      commandProcessors = __webpack_require__(32),
      commandParsers = __webpack_require__(35),
      commandEmitters = __webpack_require__(40);
  
  function sanitizeArgs(args) {
    return args.map(String);
  }
  
  function ensureArray(args) {
    return _.isArray(args) ? args : [args];
  }
  
  function execute(mpd, command, args, client) {
    var cmd;
  
    args = sanitizeArgs(ensureArray(args));
  
    cmd = mpdcmd(command, args);
  
    debug('Received: %s %s', command, JSON.stringify(args));
  
    mpd.sendCommand(cmd, function (err, result) {
  
      // First parse the result.
      var parser = commandParsers.parserForCommand(command, args);
  
      var response = parser.parse(result);
  
      // Then emit it to the client.
      var emitter = commandEmitters.emitterForCommand(command);
  
      emitter(command, args, response, client);
    });
  }
  
  var clientsManager = ClientsManager.instance();
  
  var BasicMode = (function () {
    _createClass(BasicMode, null, [{
      key: 'create',
      value: function create(mpd) {
        return new BasicMode(mpd);
      }
    }]);
  
    function BasicMode(mpd) {
      _classCallCheck(this, BasicMode);
  
      this.type = 'freeforall';
      this.mpd = mpd;
    }
  
    _createClass(BasicMode, [{
      key: 'connected',
      value: function connected(client) {
        client.emit('connected', {
          userid: client.info.userid,
          info: client.info,
          clients: clientsManager.clientsInfo(),
          mode: this.type
        });
      }
    }, {
      key: 'command',
      value: function command(_command, args, client) {
  
        _command = _command.toLowerCase();
  
        if (this.canExecute(_command, client)) {
  
          args = sanitizeArgs(ensureArray(args));
  
          // Run the command through the processor, which calls back with modified args (e.g. Youtube stream from url).
          var promise = commandProcessors.processorForCommand(this.mpd, _command, args);
  
          promise.then((function (args) {
            execute(this.mpd, _command, args, client);
          }).bind(this)).fail(function (error) {
            console.log('Failed to run command: %s (%s) for user %s', _command, JSON.stringify(args), client.info.userid);
            console.log('Error: %s', error);
  
            client.emit('error', {
              command: _command,
              args: args
            });
          });
        } else {
          console.log('nopermission', _command);
  
          client.emit(_command, {
            type: 'nopermission'
          });
        }
      }
  
      // TODO: Review this.
    }, {
      key: 'commands',
      value: function commands(cmds, client) {
  
        cmds = cmds || [];
  
        cmds = cmds.map(function (cmd) {
          cmd.args = sanitizeArgs(ensureArray(cmd.args));
  
          return cmd;
        });
  
        if (_.all(cmds, function (cmd) {
          return this.canExecute(cmd, client);
        }, this)) {
  
          // TODO: Processing each command asynchronously is a bit of a problem. Skipping for now.
  
          cmds = cmds.map(function (cmd) {
            return mpdcmd(cmd.command, cmd.args);
          });
  
          debug(cmds);
  
          this.mpd.sendCommands(cmds, function (err, result) {
  
            debug('Result for command list');
            debug(cmds);
            debug('===');
            debug(result);
          });
        }
      }
    }, {
      key: 'canExecute',
      value: function canExecute(command, client) {
        return !!clientsManager.get(client.info.userid);
      }
    }]);
  
    return BasicMode;
  })();
  
  exports['default'] = BasicMode;
  module.exports = exports['default'];

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  var Q = __webpack_require__(33);
  var debug = __webpack_require__(7)('mpdisco:command_processors');
  var exec = __webpack_require__(34).exec;
  
  var processors = {
    add: function add(mpd, args, resolve, reject) {
      if (!args.length) {
        reject('No arguments provided.');
      }
  
      var url = args[0];
  
      if (/^https?:\/\/.*?youtube.com\/watch/.test(url)) {
        // Only run if this matches our condition.
        exec('youtube-dl -g ' + url, function (error, stdout, stderr) {
  
          if (error) {
            reject(error);
  
            return;
          }
  
          var streamUrl = stdout.trim();
  
          debug('Retrieved stream url for YouTube link %s: %s', url, streamUrl);
  
          resolve(streamUrl);
        });
  
        return;
      }
  
      // Just do nothing.
      resolve(args);
    }
  };
  
  function createProcessorPromise(mpd, command, args) {
    return Q.promise(function (resolve, reject) {
      var processor = processors[command];
  
      if (processor) {
        processor(mpd, args, resolve, reject);
      } else {
        // Do nothing.
        resolve(args);
      }
    });
  }
  
  module.exports = {
    processorForCommand: createProcessorPromise
  };

/***/ },
/* 33 */
/***/ function(module, exports) {

  module.exports = require("q");

/***/ },
/* 34 */
/***/ function(module, exports) {

  module.exports = require("child_process");

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  var ObjectListParser = __webpack_require__(36);
  var SimpleParser = __webpack_require__(38);
  var LineParser = __webpack_require__(39);
  
  var parsers = {
      'list': new LineParser(),
      'list:album': new LineParser(),
      'find': new ObjectListParser('file'),
      'playlistinfo': new ObjectListParser('file'),
      'simple': new SimpleParser()
  };
  
  module.exports = {
      parsers: parsers,
      parserForCommand: function parserForCommand(command, args) {
          var key = command + ':' + args[0];
  
          return parsers[key] || parsers[command] || parsers.simple;
      }
  };

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  var AbstractParser = __webpack_require__(37),
      _ = __webpack_require__(3);
  
  var ObjectListParser = (function (_AbstractParser) {
    _inherits(ObjectListParser, _AbstractParser);
  
    function ObjectListParser(separatorKey) {
      _classCallCheck(this, ObjectListParser);
  
      _get(Object.getPrototypeOf(ObjectListParser.prototype), 'constructor', this).call(this);
  
      this.separatorKey = separatorKey;
    }
  
    _createClass(ObjectListParser, [{
      key: 'parse',
      value: function parse(s) {
        var obj = {},
            json = [];
  
        if (!s) {
          return json;
        }
  
        s.split('\n').forEach(function (l, index) {
          if (!l) {
            return;
          }
  
          var o = this.parseLine(l);
  
          // If we ran into an existing key, it means it's a new record.
          if (o.key === this.separatorKey && index > 0) {
            json.push(obj);
  
            obj = {};
          }
  
          obj[o.key] = o.value;
        }, this);
  
        json.push(obj);
  
        return json;
      }
    }]);
  
    return ObjectListParser;
  })(AbstractParser);
  
  exports['default'] = ObjectListParser;
  module.exports = exports['default'];

/***/ },
/* 37 */
/***/ function(module, exports) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  var AbstractParser = (function () {
    function AbstractParser() {
      _classCallCheck(this, AbstractParser);
    }
  
    _createClass(AbstractParser, [{
      key: 'parse',
      value: function parse(response) {
        return {};
      }
    }, {
      key: 'parseLine',
      value: function parseLine(l) {
        var i = l.indexOf(':'),
            key = l.slice(0, i).toLowerCase().trim(),
            value = (l.slice(i + 1) || '').trim();
  
        return {
          key: key,
          value: value
        };
      }
    }]);
  
    return AbstractParser;
  })();
  
  exports['default'] = AbstractParser;
  module.exports = exports['default'];

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  var AbstractParser = __webpack_require__(37),
      _ = __webpack_require__(3);
  
  var SimpleParser = (function (_AbstractParser) {
    _inherits(SimpleParser, _AbstractParser);
  
    function SimpleParser() {
      _classCallCheck(this, SimpleParser);
  
      _get(Object.getPrototypeOf(SimpleParser.prototype), 'constructor', this).apply(this, arguments);
    }
  
    _createClass(SimpleParser, [{
      key: 'parse',
      value: function parse(s) {
        if (!s) {
          return s;
        }
  
        var that = this,
            lines = s.split('\n'),
            obj = {},
            json = [],
            overwrites = 0;
  
        _(lines).chain().compact().each(function (l, index) {
          var o = that.parseLine(l);
  
          if (obj.hasOwnProperty(o.key) && overwrites >= 2) {
            console.warn('Key overwrite when parsing response (key=' + o.key + '), SimpleParser could be wrong for response. Response:');
            console.warn(s);
          }
  
          obj[o.key] = o.value;
        });
  
        json.push(obj);
  
        return json.length == 1 ? json[0] : json;
      }
    }]);
  
    return SimpleParser;
  })(AbstractParser);
  
  exports['default'] = SimpleParser;
  module.exports = exports['default'];

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  var AbstractParser = __webpack_require__(37),
      _ = __webpack_require__(3);
  
  var LineParser = (function (_AbstractParser) {
    _inherits(LineParser, _AbstractParser);
  
    function LineParser() {
      _classCallCheck(this, LineParser);
  
      _get(Object.getPrototypeOf(LineParser.prototype), 'constructor', this).apply(this, arguments);
    }
  
    _createClass(LineParser, [{
      key: 'parse',
      value: function parse(s) {
        if (!s) {
          return s;
        }
  
        var that = this,
            lines = s.split('\n'),
            obj,
            json = [];
  
        _(lines).chain().compact().each(function (l, index) {
          var o = that.parseLine(l);
  
          obj = {};
  
          obj[o.key] = o.value;
  
          json.push(obj);
        });
  
        return json;
      }
    }]);
  
    return LineParser;
  })(AbstractParser);
  
  exports['default'] = LineParser;
  module.exports = exports['default'];

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  var debug = __webpack_require__(7)('mpdisco:command_emitters');
  var CoverArt = __webpack_require__(41);
  
  function log(command, args, response) {
      debug('Emitting: %s %s: %s', command, JSON.stringify(args), JSON.stringify(response));
  }
  
  var specialEmitters = {
      list: function emitSpecializedEvent(command, args, response, client) {
          if (args.length) {
              log(command, args, response);
  
              client.emit(command, response);
  
              command = command + ':' + args[0].toLowerCase();
  
              log(command, args.slice(1), response);
  
              client.emit(command, {
                  args: args.slice(1),
                  data: response
              });
          }
      },
      find: function emitCommandWithEverySecondArg(command, args, response, client) {
          if (args.length) {
              log(command, args, response);
  
              client.emit(command, {
                  args: args.filter(function (v, i) {
                      return i % 2 == 1;
                  }),
                  data: response
              });
          }
      },
      currentsong: function currentsong(command, args, response, client) {
  
          client.emit(command, response);
  
          log(command, args, response);
  
          if (response && response.artist && response.album) {
  
              CoverArt.getCover({ artist: response.artist, release: response.album }).then(function (url) {
                  debug('Sending cover: %s', url);
  
                  client.emit('coverart', {
                      url: url
                  });
              }).fail(function (error) {
                  debug('Cover retrieval failed. %s', error);
  
                  client.emit('coverart', {
                      url: null
                  });
              });
          }
      }
  };
  
  function simpleEmitter(command, args, response, client) {
      log(command, args, response);
  
      client.emit(command, response);
  }
  
  module.exports = {
      emitters: specialEmitters,
      emitterForCommand: function emitterForCommand(command) {
          return specialEmitters[command] || simpleEmitter;
      }
  };

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  var config = __webpack_require__(30),
      mm = __webpack_require__(13),
      http = __webpack_require__(8),
      httpFollower = __webpack_require__(26),
      path = __webpack_require__(2),
      fs = __webpack_require__(15),
      Q = __webpack_require__(33),
      _ = __webpack_require__(20);
  
  var CoverArt = (function () {
    function CoverArt() {
      _classCallCheck(this, CoverArt);
    }
  
    _createClass(CoverArt, [{
      key: 'getCover',
      value: function getCover(options) {
        var output = this._outputPath(options);
  
        var promise = Q.promise((function (resolve, reject) {
  
          var urlName = function urlName(s) {
            return mm.safeName(s).replace(/_/g, '-').toLowerCase();
          };
  
          var path = '/covers/' + urlName(options.artist) + '/' + urlName(options.release);
  
          if (fs.existsSync(output)) {
            resolve(path);
          } else {
            this._findRelease(options).then((function (urls) {
              return this._retrieveCover(urls);
            }).bind(this), reject).then((function (url) {
              return this._downloadCover(url, output);
            }).bind(this), reject).done(function () {
              resolve(path);
            }, reject);
          }
        }).bind(this));
  
        return promise;
      }
    }, {
      key: '_findRelease',
      value: function _findRelease(options) {
        return Q.promise((function (resolve, reject) {
  
          var host = 'musicbrainz.org',
              path = '/ws/2/release/?fmt=json&query=',
              query;
  
          query = _.map(options, function (v, k) {
            return k + ':"' + v + '"';
          }).join(' AND ');
  
          if (!query) {
            reject('Could not form query.');
  
            return;
          }
  
          var opts = {
            host: host,
            path: path + encodeURIComponent(query),
            headers: {
              'User-Agent': 'MPDisco/1.0'
            }
          };
  
          http.get(opts, (function (res) {
            var body = '';
  
            if (res.statusCode != 200) {
              reject('Server responded with status: ' + res.statusCode);
  
              return;
            }
  
            res.on('data', function (chunk) {
              body += chunk;
            });
  
            res.on('end', (function () {
  
              var json = JSON.parse(body);
  
              var results = this._extractBestGuessReleases(json);
  
              if (!results) {
                reject('No releases found.');
              }
  
              var urls = _.map(results, function (result) {
                return 'http://coverartarchive.org/release/' + result.id + '/front-250';
              });
  
              resolve(urls);
            }).bind(this));
  
            res.on('error', function (e) {
              reject(e);
            });
          }).bind(this));
        }).bind(this));
      }
    }, {
      key: '_retrieveCover',
      value: function _retrieveCover(urls) {
        return Q.promise(function (resolve, reject) {
          function getCover(url) {
            if (urls.length <= 0) {
              reject('No covers found.');
  
              return;
            }
  
            http.get(url, (function (res) {
              if (res.statusCode === 307 && res.headers.location) {
                resolve(res.headers.location);
  
                return;
              }
  
              getCover(urls.shift());
            }).bind(this));
          }
  
          getCover(urls.shift());
        });
      }
    }, {
      key: '_downloadCover',
      value: function _downloadCover(url, output) {
        var file = fs.createWriteStream(output);
  
        var promise = Q.promise(function (resolve, reject) {
          httpFollower.get(url, function followRedirects(res) {
            res.pipe(file);
  
            res.on('end', function () {
              resolve(file);
            });
  
            file.on('error', reject);
  
            res.on('error', reject);
          });
        });
  
        return promise;
      }
    }, {
      key: '_outputPath',
      value: function _outputPath(options) {
  
        var output = path.join(config.music_directory.replace(/^~/, process.env.HOME), mm.safeName(options.artist), mm.safeName(options.release), 'front.jpg');
  
        return output;
      }
    }, {
      key: '_extractBestGuessReleases',
      value: function _extractBestGuessReleases(json) {
  
        var results = [];
  
        if (json.count <= 0) {
          return;
        }
  
        results.concat(_.where(json.releases, { country: 'US' }));
  
        results.concat(_.where(json.releases, { country: 'XE' }));
  
        results.concat(_.where(json.releases, { country: 'GB' }));
  
        return results.concat(_.without(json.releases, results)); // Append the rest and return.
      }
    }]);
  
    return CoverArt;
  })();
  
  exports['default'] = new CoverArt();
  module.exports = exports['default'];

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
  
  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  var _debug = __webpack_require__(7);
  
  var _debug2 = _interopRequireDefault(_debug);
  
  var _basic_modeJs = __webpack_require__(31);
  
  var _basic_modeJs2 = _interopRequireDefault(_basic_modeJs);
  
  var _clients_managerJs = __webpack_require__(23);
  
  var _clients_managerJs2 = _interopRequireDefault(_clients_managerJs);
  
  var _configJson = __webpack_require__(30);
  
  var _configJson2 = _interopRequireDefault(_configJson);
  
  var debug = (0, _debug2['default'])('mpdisco:master_mode');
  
  var MasterMode = (function (_BasicMode) {
    _inherits(MasterMode, _BasicMode);
  
    _createClass(MasterMode, null, [{
      key: 'create',
      value: function create(mpd) {
        return new MasterMode(mpd);
      }
    }, {
      key: 'commandWhitelist',
      value: ['currentsong', 'status', 'playlistinfo', 'list', 'find', 'update'],
      enumerable: true
    }]);
  
    function MasterMode(mpd) {
      _classCallCheck(this, MasterMode);
  
      _get(Object.getPrototypeOf(MasterMode.prototype), 'constructor', this).call(this, mpd);
  
      this.type = 'master';
  
      this.master = null;
  
      var clientsManager = this.clientsManager = _clients_managerJs2['default'].instance();
  
      clientsManager.on('disconnected', this.disconnected.bind(this));
  
      clientsManager.on('connected', this.connected.bind(this));
  
      clientsManager.on('identified', this.identified.bind(this));
    }
  
    _createClass(MasterMode, [{
      key: 'connected',
      value: function connected(client) {
        client.emit('connected', {
          userid: client.info.userid,
          info: client.info,
          clients: this.clientsManager.clientsInfo(),
          mode: this.type,
          master: this.master
        });
      }
    }, {
      key: 'disconnected',
      value: function disconnected(client) {
        if (this.clientsManager.isEmpty()) {
          this.clearMaster();
        } else if (!this.isMaster(this.clientsManager.first())) {
          this.setMaster(this.clientsManager.first());
        }
      }
    }, {
      key: 'identified',
      value: function identified(client) {
        if (!this.master && !this.clientsManager.isEmpty()) {
          this.setMaster(this.clientsManager.first());
        }
      }
    }, {
      key: 'rotate',
      value: function rotate() {
        if (this.clientsManager.isEmpty()) {
          return;
        }
  
        this.clientsManager.rotate();
  
        this.setMaster(this.clientsManager.first());
      }
    }, {
      key: 'canExecute',
      value: function canExecute(command, client) {
        return this.isMaster(client) || this.isWhitelistCommand(command);
      }
    }, {
      key: 'isMaster',
      value: function isMaster(client) {
        return this.master === client.info.userid;
      }
    }, {
      key: 'setMaster',
      value: function setMaster(client) {
        if (!client) {
          this.master = null;
  
          debug('Master cleared.');
  
          return;
        }
  
        this.master = client.info.userid;
  
        debug('Master changed: %s', this.master);
  
        this.setMasterTimeout();
  
        client.emit('master', this.master);
        client.broadcast.emit('master', this.master);
      }
    }, {
      key: 'clearMaster',
      value: function clearMaster() {
        this.setMaster(null);
      }
    }, {
      key: 'setMasterTimeout',
      value: function setMasterTimeout() {
  
        var masterTime = +_configJson2['default'].master_time;
  
        clearTimeout(this.masterTimeout);
  
        debug('Master timeout: %s min', masterTime);
  
        this.masterTimestamp = Date.now();
  
        this.masterTimeout = setTimeout((function () {
          debug('Rotating master');
  
          this.clientsManager.rotate();
  
          this.setMaster(this.clientsManager.first());
        }).bind(this), masterTime * 60 * 1000);
      }
    }, {
      key: 'isWhitelistCommand',
      value: function isWhitelistCommand(cmd) {
        return MasterMode.commandWhitelist.indexOf(cmd) !== -1;
      }
    }]);
  
    return MasterMode;
  })(_basic_modeJs2['default']);
  
  exports['default'] = MasterMode;
  module.exports = exports['default'];

/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map