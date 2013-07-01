define(['marionette', 'network', 'handlebars', 'underscore'], function(Marionette, Network, Handlebars, _) {

  _.findIndex = function(obj, iterator, context) {
    var result = -1;
    _.any(obj, function(value, index, list) {
        if(iterator.call(context, value, index, list)) {
            result = index;
            return true;
        }
    });
    return result;
  }
  
  Handlebars.registerHelper('time', function(time) {
    time = time || '';
    
    var parts = time.split(':');
    
    return new Handlebars.SafeString('<span class="time running">' + MPDisco.Utils.formatSeconds(parts[0]) + '</span>' + (parts.length > 1 ? ' / <span class="time length">' + MPDisco.Utils.formatSeconds(parts[1]) + '</span>' : ''));
  });
  
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
          
          // Gives a way to remove these callbacks.
          this.socketOff = function(key) {
            var method = this.socketEvents[key];
            
            if (!_.isFunction(method)) {
              method = this[this.socketEvents[key]];
            }
            
            if (!method) {
              throw new Error('Method "' + this.socketEvents[key] + '" does not exist');
            }
            
            MPDisco.network.off(key, method);
          }.bind(this);
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
      },
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
  
  MPDisco.command = MPDisco.network.command.bind(MPDisco.network);
  
  MPDisco.commands = MPDisco.network.commands.bind(MPDisco.network);
  
  MPDisco.Utils = {
    formatSeconds: function(t) {
      return Math.floor(+t / 60) + ':' + MPDisco.Utils.pad(+t % 60);
    },
    pad: function(n) {
      if (+n < 10) {
        return '0' + n;
      }
      
      return n;
    }
  };
  
  MPDisco.Error = MPDisco.Model.extend({
    socketEvents: {
      error: 'set'
    }
  });
  MPDisco.ErrorView = Marionette.ItemView.extend({
    className: 'error',
    
    template: '#error_template',
    
    model: new MPDisco.Error,
    
    modelEvents: {
      change: 'show'
    },
    
    socketEvents: {
      error: 'show'
    },
    
    events: {
      'click .close': 'hide'
    },
    
    show: function() {
      this.render();
      
      this.$el.addClass('shown');
    },
    
    hide: function() {
      this.$el.removeClass('shown');
    }
  });
  
  MPDisco.State = MPDisco.Model.extend({
    socketEvents: {
      status: 'set'
    }
  });
  
  MPDisco.state = new MPDisco.State;
  
  MPDisco.Layout = Marionette.Layout.extend({
    template: '#layout_template',
    regions: {
      player: '#player',
      user: '#user',
      scrubber: '#scrubber',
      playlist: '#playlist',
      listeners: '#listeners',
      library: '#library',
      error: '#error'
    }
  });
  
  MPDisco.addRegions({
    container: '#container'
  });
  
  MPDisco.addInitializer(function() {
    if (Backbone.history) {
      Backbone.history.start();
    }
  });
  
  MPDisco.addInitializer(function() {
    MPDisco.mode = MPDisco.module('MasterMode').Mode;
    
    this.layout = new MPDisco.Layout;
    
    this.container.show(this.layout);
    
    this.layout.player.show(new MPDisco.mode.player);
    
    this.layout.user.show(new MPDisco.mode.user);
    
    this.layout.scrubber.show(new MPDisco.mode.scrubber);
    
    this.layout.playlist.show(new MPDisco.mode.playlist);
    
    this.layout.listeners.show(new MPDisco.mode.listeners);
    
    this.layout.library.show(new MPDisco.mode.library);
    
    this.layout.error.show(new MPDisco.ErrorView);
    
    this.network.command('status');
  });
  
  return MPDisco;
});
