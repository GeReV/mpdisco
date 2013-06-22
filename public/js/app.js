require.config({
  baseURL: 'js',
  shim: {
    jquery: {
      exports: '$'
    },
    jqueryui: {
      deps: ['jquery'],
      exports: '$'
    },
    jquerysortable: {
      deps: ['jquery'],
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery',
        'jqueryui'
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
  paths: {
    json:  'vendor/requirejs-plugins/json',
    text: 'vendor/requirejs-plugins/text',
    backbone: 'vendor/backbone-min',
    underscore: 'vendor/underscore-min',
    jquery: 'vendor/jquery',
    jqueryui: 'vendor/jquery-ui',
    'jquery.ui.widget': 'vendor/jquery.ui.widget',
    jquerysortable: 'vendor/jquery-sortable',
    marionette: 'vendor/backbone-marionette-min',
    handlebars: 'vendor/handlebars',
    'class': 'vendor/class'
  }
});

require(['mpdisco', 'syncer', 'player', 'playlist', 'library'], function(MPDisco) {

  MPDisco.vent.on('connected', function(data) {
    console.log('Connected.', data);
  });

  MPDisco.vent.on('update', function(data) {
    console.log('Update: ', data);
  });

  $(function() {
    MPDisco.start();
  });

});
