define(['marionette', 'network', 'handlebars', 'underscore'], function(Marionette, Network, Handlebars, _) {
  
  Marionette.TemplateCache.prototype.loadTemplate = function(template) {
  // use Handlebars.js to compile the template
    return $(template).html();
  };
  
  Marionette.TemplateCache.prototype.compileTemplate = function(template) {
  // use Handlebars.js to compile the template
    return Handlebars.compile(template);
  };
  
  var buildSocketEventsMixinFor = function(type) {
    
    return {
      constructor: function () {
        if (this.socketEvents && _.size(this.socketEvents) > 0) {
            this.delegateSocketEvents(this.socketEvents);
        }
        
        var args = Array.prototype.slice.apply(arguments);
        
        type.prototype.constructor.apply(this, args);
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
    };
    
  };
  
  var MPDisco = new Marionette.Application;
  
  // TODO: Nicer way to do this?
  Marionette.View = Marionette.View.extend(buildSocketEventsMixinFor(Marionette.View));
  Marionette.ItemView = Marionette.ItemView.extend(buildSocketEventsMixinFor(Marionette.ItemView));
  Marionette.CollectionView = Marionette.CollectionView.extend(buildSocketEventsMixinFor(Marionette.CollectionView));
  Marionette.CompositeView = Marionette.CompositeView.extend(buildSocketEventsMixinFor(Marionette.CompositeView));
  
  MPDisco.Collection = Backbone.Collection.extend(buildSocketEventsMixinFor(Backbone.Collection));
  
  MPDisco.Model = Backbone.Model.extend(buildSocketEventsMixinFor(Backbone.Model));

  var host = window.location.hostname;
  
  MPDisco.network = new Network(host, 3000);
  
  MPDisco.State = MPDisco.Model.extend({
    socketEvents: {
      status: 'set'
    }
  });
  
  MPDisco.state = new MPDisco.State;
  
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
    
    this.network.command('status');
  });
  
  return MPDisco;
});
