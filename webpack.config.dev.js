import path from 'path';
import webpack, { DefinePlugin } from 'webpack';
import merge from 'lodash/object/merge';
import autoprefixer from 'autoprefixer-core';

const STYLE_LOADER = 'style-loader/useable';
const CSS_LOADER = 'css-loader';
const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 20',
  'Firefox >= 24',
  'Explorer >= 8',
  'iOS >= 6',
  'Opera >= 12',
  'Safari >= 6'
];
const GLOBALS = {
  'process.env.NODE_ENV': '"development"',
  '__DEV__': true
};

export default {
  client: {
    devtool: 'source-map',
    entry: [
      'webpack-dev-server/client?http://localhost:3001',
      'webpack/hot/only-dev-server',
      './src/client/js/mpdisco.jsx'
    ],
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'mpdisco.js',
      publicPath: '/build/public/'
    },

    cache: true,
    debug: true,

    stats: {
      colors: true,
      reasons: true
    },

    plugins: [
      new DefinePlugin(GLOBALS),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    module: {
      //preLoaders: [
      //  {
      //    test: /\.js$/,
      //    exclude: /node_modules/,
      //    loader: 'eslint-loader'
      //  }
      //],

      loaders: [
        {
          test: /\.css$/,
          loader: `${STYLE_LOADER}!${CSS_LOADER}!postcss-loader`
        },
        {
          test: /\.scss$/,
          loader: `${STYLE_LOADER}!${CSS_LOADER}!postcss-loader!sass-loader`
        },
        {
          test: /\.gif/,
          loader: 'url-loader?limit=10000&mimetype=image/gif'
        },
        {
          test: /\.jpg/,
          loader: 'url-loader?limit=10000&mimetype=image/jpg'
        },
        {
          test: /\.png/,
          loader: 'url-loader?limit=10000&mimetype=image/png'
        },
        {
          test: /\.svg/,
          loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },

    postcss: [autoprefixer(AUTOPREFIXER_BROWSERS)],

    loaders: [{
      test: /\.jsx?$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src', 'client')
    }]
  },

  server: {
    target: 'node',

    entry: './src/server/index.js',

    output: {
      path: path.join(__dirname, 'build', 'server'),
      filename: 'server.js'
    },

    cache: true,
    debug: true,

    stats: {
      colors: true,
      reasons: true
    },

    plugins: [
      new DefinePlugin(GLOBALS),
      new webpack.NoErrorsPlugin()
    ],
    resolve: {
      extensions: ['', '.js', '.json']
    },
    module: {
      //preLoaders: [
      //  {
      //    test: /\.js$/,
      //    exclude: /node_modules/,
      //    loader: 'eslint-loader'
      //  }
      //],

      loaders: [
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },

    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: path.join(__dirname, 'src', 'server')
    }]
  }
}