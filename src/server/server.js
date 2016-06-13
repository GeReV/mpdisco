
import 'babel-core/polyfill';

import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import io from 'socket.io/lib/index.js';
import React from 'react';
import ReactDOM from 'react-dom/server';
import _ from 'lodash';

import Router from './routes';
import Html from './components/html';

const debug = require('debug')('mpdisco:server');

const metadata = require('./meta_data.js');
const upload = require('./file_upload.js');
const ClientsManager = require('./clients_manager.js');

export default class Server {
  static defaults = {
    serverPort: 3000
  };

  constructor(mpd, mode, options) {
    this.options = _.defaults(Server.defaults, options);

    this.mpd = mpd;
    this.mode = mode;

    this.uploadHandler = this._initUploadHandler(this.mpd, this.options.config);

    const sessionStore = session({
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

    const config = options.config;

    app.use(compression());
    app.use(cookieParser());

    app.use(session);

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', async (req, res) => {
      try {
        let statusCode = 200;
        const data = {title: '', description: '', css: '', body: ''};
        const css = [];
        const context = {
          onInsertCss: value => css.push(value),
          onSetTitle: value => data.title = value,
          onSetMeta: (key, value) => data[key] = value,
          onPageNotFound: () => statusCode = 404
        };

        await Router.dispatch({path: req.path, context}, (state, component) => {
          data.body = ReactDOM.renderToString(component);
          data.css = css.join('');
        });

        const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
        res.status(statusCode).send('<!doctype html>\n' + html);
      } catch (err) {
        next(err);
      }
    });

    app.get('/covers/:artist/:album', (req, res) => {
      const mm = require('./meta_data.js');
      const artist = mm.safeName(req.params.artist);
      const album = mm.safeName(req.params.album);
      const file = path.join(config.music_directory.replace(/^~/, process.env.HOME), artist, album, 'front.jpg');

      fs.stat(file, (err, stats) => {
        if (stats && stats.isFile()) {
          res.sendFile(file, {maxAge: 7 * 24 * 60 * 60 * 1000});
        } else {
          res.status(404)
            .end();
        }
      });
    });

    app.all('/upload', this.uploadHandler);
  }

  start() {
    const options = this.options;
    const port = options.serverPort;

    this.server.listen(port, () => {
      if (process.send) {
        process.send('online');
      } else {
        console.log('MPDisco Server :: Listening on port ' + port);
      }
    });
  }

  _initSocketIO(socket, iosession, clientsManager) {
    // Socket.io will call this function when a client connects,
    // So we can send that client a unique ID we use so we can
    // maintain the list of players.
    socket.on('connection', client => {
      // Embed the session in the client's handshake.
      session(client.handshake, {}, () => {
        clientsManager.connected(client);

        client.on('command', cmd => {
          this.mode.command(cmd.command, cmd.args, client);
        });

        client.on('commands', cmds => {
          this.mode.commands(cmds, client);
        });
      });
    });

    this.mpd.on('system', system => {
      socket.sockets.emit('update', system);
      socket.sockets.emit('update:' + system);
    });
  }

  _initUploadHandler(mpd, config) {
    const handler = upload({
      acceptFileTypes: /\.(mp3|ogg|flac|mp4)/i,
      tmpDir: '/tmp',
      uploadPath: (file, callback) => {
        metadata.forFile(file)
          .then(data => {
            const parts = _.compact([
              config.music_directory.replace(/^~/, process.env.HOME),

              metadata.safeName(data.artist.length ? data.artist.join('_') : data.artist),

              metadata.safeName(data.album)
            ]);

            const filename = path.join.apply(this, parts);

            debug('Saving uploaded file to %s', filename);

            callback(filename);
          })
          .error(console.error);
      }
    });

    handler.on('end', _.debounce(() => {
      debug('Updating database...');

      mpd.sendCommand('update');
    }, 5000));

    return handler;
  }
}
