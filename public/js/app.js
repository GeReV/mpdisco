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

require(['mpdisco', 'syncer', 'basic_mode', 'master_mode'], function(MPDisco) {

  $(function() {
    MPDisco.network.on('connected', function(data) {
      MPDisco.meta = data;
      
      MPDisco.start();
      
      MPDisco.vent.trigger('networkready', data);
      
      console.log('Connected.', data);
    });
    
  });

});
