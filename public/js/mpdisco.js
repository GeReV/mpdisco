define(['marionette', 'network', 'handlebars'], function(Marionette, Network, Handlebars) {
  
  Marionette.TemplateCache.prototype.loadTemplate = function(template) {
  // use Handlebars.js to compile the template
    return $(template).html();
  };
  
  Marionette.TemplateCache.prototype.compileTemplate = function(template) {
  // use Handlebars.js to compile the template
    return Handlebars.compile(template);
  };
  
  var MPDisco = new Marionette.Application;
  
  MPDisco.Collection = Backbone.Collection.extend({
 
    constructor: function () {
        if (this.socket_events && _.size(this.socket_events) > 0) {
            this.delegateSocketEvents(this.socket_events);
        }
        
        var args = Array.prototype.slice.apply(arguments);
        Backbone.Collection.prototype.constructor.apply(this, args);
    },
 
    delegateSocketEvents: function (events) {
        for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) {
                method = this[events[key]];
            }
 
            if (!method) {
                throw new Error('Method "' + events[key] + '" does not exist');
            }
 
            method = _.bind(method, this);
            MPDisco.network.on(key, method);
        };
    }
  });
  
  MPDisco.Model = Backbone.Model.extend({
 
    constructor: function () {
        if (this.socket_events && _.size(this.socket_events) > 0) {
            this.delegateSocketEvents(this.socket_events);
        }
        
        var args = Array.prototype.slice.apply(arguments);
        Backbone.Model.prototype.constructor.apply(this, args);
    },
 
    delegateSocketEvents: function (events) {
        for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) {
                method = this[events[key]];
            }
 
            if (!method) {
                throw new Error('Method "' + events[key] + '" does not exist');
            }
 
            method = _.bind(method, this);
            MPDisco.network.on(key, method);
        };
    }
  });
  
  MPDisco.network = new Network('localhost', 3000);
  
  MPDisco.Layout = Marionette.Layout.extend({
    template: '#layout_template',
    regions: {
      controls: '#controls',
      playlist: '#playlist'
    }
  });
  
  MPDisco.addRegions({
    container: '#container'
  });
  
  MPDisco.addInitializer(function(options) {
    
    this.network.subscribe(function(name, data) {
      MPDisco.vent.trigger(name, data);
    });
    
    if (Backbone.history) {
      Backbone.history.start();
    }
  });
  
  MPDisco.addInitializer(function() {
    this.layout = new MPDisco.Layout;
    
    this.container.show(this.layout);
    
    this.layout.controls.show(new MPDisco.Controls.ControlsView);
    
    this.layout.playlist.show(new MPDisco.Playlist.PlaylistView);
  });
  
  return MPDisco;
});
