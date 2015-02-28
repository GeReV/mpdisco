require.config({
  baseURL: 'js',
  shim: {
    jquery: {
      exports: '$'
    },
    jqueryui: {
      deps: [
        'jquery'
      ],
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
     class: {
      exports: 'Class'
    },
    templates: {
      deps: [
        'handlebars'
      ]
    }
  },
  paths: {
    json: 'vendor/requirejs-plugins/json',
    text: 'vendor/requirejs-plugins/text',
    backbone: 'vendor/backbone',
    underscore: 'vendor/underscore/underscore',
    jquery: 'vendor/jquery/jquery',
    jqueryui: 'vendor/jquery-ui',
    'jquery.ui.widget': 'vendor/jquery.ui.widget.js',
    'jquery.cookie': 'vendor/jquery.cookie/jquery.cookie.js',
    marionette: 'vendor/backbone.marionette',
    handlebars: 'vendor/handlebars',
    class: 'vendor/class',
    react: 'vendor/react/react',
    'socket.io': 'vendor/socket.io/index'
  },
  packages: [

  ]
});

require(['mpdisco', 'templates', 'syncer', 'basic_mode', 'master_mode'], function(MPDisco) {

  $(function() {
    MPDisco.network.on('connected', function(data) {
      MPDisco.meta = data;
      
      MPDisco.start();
      
      MPDisco.vent.trigger('networkready', data);
      
      console.log('Connected.', data);
    });
  });

});
