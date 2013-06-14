define(['marionette', 'network'], function(Marionette, Network) {
  var MPDisco = new Marionette.Application();
  
  MPDisco.addInitializer(function(options) {
    
    this.network = new Network('localhost', 3000);
    
    this.network.subscribe(function(name, data) {
      MPDisco.vent.trigger(name, data);
    });
    
    this.network.connect();
    
    if (Backbone.history) {
      Backbone.history.start();
    }
  });
  
  return MPDisco;
});
