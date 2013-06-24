define(['class'], function(Class) {
  var Network = Class.extend({
    init: function(host, port) {
      this.url = "ws://"+ host +":"+ port +"/",
      this.callbacks = [];
      
      this.socket = io.connect(this.url);
    },
    send: function(data) {
      this.socket.emit('command', data);
    },
    command: function(command, args) {
      
      if (args === undefined || args === null) {
        args = [];
      }
      
      this.socket.emit('command', {
        command: command,
        args: args
      });
    },
    commands: function(commands) {
      this.socket.emit('commands', commands);
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
