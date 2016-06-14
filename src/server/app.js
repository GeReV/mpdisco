import path from 'path';
import _ from 'lodash';
import mpd from 'mpd';

import Server from './server.js';

class MPDisco {
  constructor(mode, options) {
    this.options = _.defaults({
      mpdPort: 6600,
      mpdHost: 'localhost',
      serverPort: process.env.PORT,
      config: require('../../config.json')
    }, options);

    this.mpd = mpd.connect({
      port: this.options.mpdPort,
      host: this.options.mpdHost
    });

    this.mpd.on('ready', function () {
      console.log('MPDisco Server :: MPD :: connection established');
    });

    this.mode = mode.create(this.mpd);

    this.server = new Server(this.mpd, this.mode, this.options);
    this.server.start();
  }
}

MPDisco.Modes = {
  Basic: require('./modes/basic_mode.js').default,
  Master: require('./modes/master_mode.js').default
};

export default MPDisco;
