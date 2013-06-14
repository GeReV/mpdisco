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
    'class': {
      exports: 'Class'
    }
  },
  paths: {
    json:  'vendor/requirejs-plugins/json',
    backbone : 'vendor/backbone-min',
    underscore : 'vendor/underscore-min',
    jquery : 'vendor/jquery-min',
    marionette : 'vendor/backbone-marionette-min',
    'class': 'vendor/class'
  }
});

define(['mpdisco'], function(MPDisco) {
  
  MPDisco.vent.on('connected', function(data) {
    console.log('Connected.', data);
  });
  
  MPDisco.start();
  
});