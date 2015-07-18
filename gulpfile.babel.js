/*
 * React.js Starter Kit
 * Copyright (c) Konstantin Tarkus (@koistya), KriaSoft LLC
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import cp from 'child_process';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import mkdirp from 'mkdirp';
import runSequence from 'run-sequence';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import minimist from 'minimist';
import config from './webpack.config.dev';

const $ = gulpLoadPlugins();
const argv = minimist(process.argv.slice(2));
const src = Object.create(null);

let watch = false;
let browserSync;

// The default task
gulp.task('default', ['sync']);

// Clean output directory
gulp.task('clean', cb => {
  del(['.tmp', 'build/*', '!build/.git'], {dot: true}, () => {
    mkdirp('build/public', cb);
  });
});

// Static files
gulp.task('assets', () => {
  src.assets = 'src/public/**';
  return gulp.src(src.assets)
    .pipe($.changed('build/public'))
    .pipe(gulp.dest('build/public'))
    .pipe($.size({title: 'assets'}));
});

// Bundle
gulp.task('bundle', cb => {
  const config = require('./webpack.config.dev.js');
  const bundler = webpack([config.client, config.server]);
  const verbose = !!argv.verbose;
  let bundlerRunCount = 0;

  function bundle(err, stats) {
    if (err) {
      throw new $.util.PluginError('webpack', err);
    }

    console.log(stats.toString({
      colors: $.util.colors.supportsColor,
      hash: verbose,
      version: verbose,
      timings: verbose,
      chunks: verbose,
      chunkModules: verbose,
      cached: verbose,
      cachedAssets: verbose
    }));

    if (++bundlerRunCount === (watch ? Object.keys(config).length : 1)) {
      return cb();
    }
  }

  if (watch) {
    bundler.watch(200, bundle);
  } else {
    bundler.run(bundle);
  }
});

// Build the app from source code
gulp.task('build', ['clean'], cb => {
  runSequence(['assets'], ['bundle'], cb);
});

// Build and start watching for modifications
gulp.task('build:watch', cb => {
  watch = true;
  runSequence('build', () => {
    gulp.watch(src.assets, ['assets']);
    cb();
  });
});

// Launch a Node.js/Express server
gulp.task('serve', ['build:watch'], cb => {
  src.server = [
    'build/server/server.js'
  ];
  let started = false;
  let server = (function startup() {
    const child = cp.fork(src.server, {
      env: Object.assign({NODE_ENV: 'development'}, process.env)
    });
    child.once('message', message => {
      if (message.match(/^online$/)) {
        if (!started) {
          started = true;
          gulp.watch(src.server, function() {
            $.util.log('Restarting development server.');
            server.kill('SIGTERM');
            server = startup();
          });
          cb();
        }
      }
    });
    return child;
  })();

  process.on('exit', () => server.kill('SIGTERM'));
});

// Launch BrowserSync development server
gulp.task('sync', ['serve'], cb => {
  new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
  }).listen(3001, 'localhost', function (err, result) {
    if (err) {
      console.log(err);
    }

    console.log('Listening at localhost:3001');
  });

  gulp.watch(['build/**/*.*'].concat(
    src.server.map(file => '!' + file)
  ));
});