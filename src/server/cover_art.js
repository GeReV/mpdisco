import config from '../../config.json';
import mm from './meta_data.js';
import http from 'http';
import httpFollower from './helpers/http_follower.js';
import path from 'path';
import fs from 'fs';
import Q from 'q';
import _ from 'underscore';

const debug = require('debug')('mpdisco:coverart');

class CoverArt {
  getCover(options) {
    const output = this.outputPath(options);

    return Q.promise((resolve, reject) => {

      const urlName = function (s) {
        return mm.safeName(s).replace(/_/g, '-').toLowerCase();
      };

      const path = `/covers/${urlName(options.artist)}/${urlName(options.release)}`;

      fs.stat(output, (err, stats) => {
        if (stats && stats.isFile()) {
          resolve(path);
        } else {
          this.findRelease(options)
            .then(this.retrieveCover, reject)
            .then(url => this.downloadCover(url, output), reject)
            .done(() => resolve(path), reject);
        }
      });
    });
  }

  findRelease(options) {
    return Q.promise((resolve, reject) => {

      const host = 'musicbrainz.org',
            path = '/ws/2/release/?fmt=json&query=',
            query = Object.keys(options).map(key => `${key}:"${options[key]}"`).join(' AND ');

      if (!query) {
        reject('Could not form query.');

        return;
      }

      const opts = {
        host: host,
        path: path + encodeURIComponent(query),
        headers: {
          'User-Agent': 'MPDisco/1.0'
        }
      };

      debug(opts);

      http.get(opts, res => {
        let body = '';

        if (res.statusCode != 200) {
          reject('Server responded with status: ' + res.statusCode);

          return;
        }

        res.on('data', function(chunk) {
          body += chunk;
        });

        res.on('end', () => {

          const json = JSON.parse(body);

          debug(json);

          const results = this.extractBestGuessReleases(json);

          debug('Best choice:', results);

          if (!results) {
            reject('No releases found.');
          }

          const urls = results.map(result => `http://coverartarchive.org/release/${result.id}/front-250`);

          resolve(urls);
        });

        res.on('error', reject);
      });
    });
  }

  retrieveCover(urls) {
    return Q.promise((resolve, reject) => {
      function getCover(url) {
        if (urls.length <= 0) {
          reject('No covers found.');

          return;
        }

        http.get(url, res => {
          if (res.statusCode === 307 && res.headers.location) {
            resolve(res.headers.location);

            return;
          }

          getCover(urls.shift());
        });
      }

      getCover(urls.shift());
    });
  }

  downloadCover(url, output) {
    const file = fs.createWriteStream(output);

    return Q.promise((resolve, reject) => {
      httpFollower.get(url, res => {
        res.pipe(file);

        res.on('end', () => resolve(file));

        file.on('error', err => {
          debug('Error on file:', err);
          reject(err);
        });

        res.on('error', err => {
          debug('Error on response:', err);
          reject(err);
        });
      });
    });
  }

  outputPath(options) {
    return path.join(
      config.music_directory.replace(/^~/, process.env.HOME),
      mm.safeName(options.artist),
      mm.safeName(options.release),
      'front.jpg'
    );
  }

  extractBestGuessReleases(json) {

    let results = [];

    if (json.count <= 0) {
      return;
    }

    results.concat(_.where(json.releases, { country: 'US' }));

    results.concat(_.where(json.releases, { country: 'XE' }));

    results.concat(_.where(json.releases, { country: 'GB' }));

    return results.concat(_.without(json.releases, results)); // Append the rest and return.

  }
}

export default new CoverArt();
