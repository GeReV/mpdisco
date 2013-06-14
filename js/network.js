define(['class'], function() {
  var Network = Class.extend({
    init: function(host, port) {
      this.url = "ws://"+ host +":"+ port +"/",
      this.callbacks = [];
    },
    connect: function() {
      this.socket = io.connect(this.url);
      
      this.socket.on('connect', this.createPublish('connect'));
      this.socket.on('onconnected', this.createPublish('connected'));
      this.socket.on('disconnect', this.createPublish('disconnected'));
      this.socket.on('clientconnected', this.createPublish('clientconnected'));
      this.socket.on('clientdisconnected', this.createPublish('clientdisconnected'));
      this.socket.on('update', this.createPublish('update'));
    },
    onConnect: function() {},
    onDisconnect: function() {},
    onClientConnected: function(userId) {},
    onClientDisconnected: function(userId) {},
    send: function(data) {
      this.socket.emit('update', data);
    },
    publish: function(name, data) {
      for (var i=0, l=this.callbacks.length; i < l; i++) {
        this.callbacks[i](name, data);
      }
    },
    subscribe: function(callback) {
      this.callbacks.push(callback);
    },
    unsubscribe: function(callback) {
      for (var i=0, l=this.callbacks.length; i < l; i++) {
        if (this.callbacks[i] === callback) {
          this.callbacks.splice(i, 1);
        }
      }
    },
    createPublish: function(name) {
      return function(data) {
        this.publish(name, data);
      }.bind(this);
    }
  });
  
  return Network;
});
