require.config({
  baseURL: 'js',
  shim: {
    jquery: {
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    marionette: {
      deps: [
        'underscore',
        'backbone',
        'jquery'
      ],
      exports: 'Marionette'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    'class': {
      exports: 'Class'
    }
  },
  hbs: {
    disableI18n: true
  },
  paths: {
    json:  'vendor/requirejs-plugins/json',
    text: 'vendor/requirejs-plugins/text',
    backbone : 'vendor/backbone-min',
    underscore : 'vendor/underscore-min',
    jquery : 'vendor/jquery-min',
    marionette : 'vendor/backbone-marionette-min',
    handlebars: 'vendor/handlebars',
    'class': 'vendor/class'
  }
});

define(['mpdisco', 'controls', 'playlist', ], function(MPDisco) {
  
  MPDisco.vent.on('connected', function(data) {
    console.log('Connected.', data);
  });
  
  MPDisco.vent.on('update', function(data) {
    console.log('Update: ', data);
  });
  
  MPDisco.start();
  
});