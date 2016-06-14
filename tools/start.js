/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Browsersync from 'browser-sync';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import run from './run';
import runServer from './runServer';
import webpackConfig from './webpack.config';
import clean from './clean';
import copy from './copy';

const DEBUG = !process.argv.includes('--release');

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
let undef;

async function start() {
  await run(clean);
  await run(copy.bind(undef, { watch: true }));
  await new Promise(resolve => {
    // Patch the client-side bundle configurations
    // to enable Hot Module Replacement (HMR) and React Transform
    webpackConfig.filter(x => x.target !== 'node').forEach(config => {
      /* eslint-disable no-param-reassign */
      config.entry = ['webpack-hot-middleware/client'].concat(config.entry);
      config.output.filename = config.output.filename.replace('[chunkhash]', '[hash]');
      config.output.chunkFilename = config.output.chunkFilename.replace('[chunkhash]', '[hash]');
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
      config.plugins.push(new webpack.NoErrorsPlugin());
      config
        .module
        .loaders
        .filter(x => x.loader === 'babel-loader')
        .forEach(x => (x.query = {
          ...x.query,

          // Wraps all React components into arbitrary transforms
          // https://github.com/gaearon/babel-plugin-react-transform
          plugins: [
            ...(x.query ? x.query.plugins : []),
            ['react-transform', {
              transforms: [
                {
                  transform: 'react-transform-hmr',
                  imports: ['react'],
                  locals: ['module']
                }, {
                  transform: 'react-transform-catch-errors',
                  imports: ['react', 'redbox-react']
                }
              ]
            }]
          ]
        }));
      /* eslint-enable no-param-reassign */
    });

    const bundler = webpack(webpackConfig);
    const wpMiddleware = webpackMiddleware(bundler, {

      // IMPORTANT: webpack middleware can't access config,
      // so we should provide publicPath by ourselves
      publicPath: webpackConfig[0].output.publicPath,

      // Pretty colored output
      stats: webpackConfig[0].stats

      // For other settings see
      // https://webpack.github.io/docs/webpack-dev-middleware
    });
    const hotMiddlewares = bundler
      .compilers
      .filter(compiler => compiler.options.target !== 'node')
      .map(compiler => webpackHotMiddleware(compiler));

    let handleServerBundleComplete = () => {
      runServer((err, host) => {
        if (!err) {
          const bs = Browsersync.create();
          bs.init({
            ...(DEBUG ? {} : { notify: false, ui: false }),

            proxy: {
              target: host,
              middleware: [wpMiddleware, ...hotMiddlewares]
            }
          }, resolve);
          handleServerBundleComplete = runServer;
        }
      });
    };

    bundler.plugin('done', () => handleServerBundleComplete());
  });
}

export default start;
