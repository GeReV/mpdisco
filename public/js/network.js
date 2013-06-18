define(['class'], function(Class) {
  var Network = Class.extend({
    init: function(host, port) {
      this.url = "ws://"+ host +":"+ port +"/",
      this.callbacks = [];
      
      this.socket = io.connect(this.url);
      
      this.socket.on('connect', this.createPublish('connect'));
      this.socket.on('connected', this.createPublish('connected'));
      this.socket.on('disconnect', this.createPublish('disconnected'));
      this.socket.on('clientconnected', this.createPublish('clientconnected'));
      this.socket.on('clientdisconnected', this.createPublish('clientdisconnected'));
      this.socket.on('update', this.createPublish('update'));
    },
    send: function(data) {
      this.socket.emit('command', data);
    },
    command: function(command, args) {
      this.send({
        command: command,
        args: args || []
      });
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
    on: function(name, callback) {
      this.socket.on(name, callback);
    },
    off: function(name, callback) {
      this.socket.of(name, callback);
    },
    createPublish: function(name) {
      return function(data) {
        this.publish(name, data);
      }.bind(this);
    }
  });
  
  return Network;
});
