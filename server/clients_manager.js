(function() {
  var Class = require('clah'),
      _ = require('underscore');
  
  var ClientsManager = Class.extend({
    init: function() {
      this.clients = [];
      this.clientsHash = {};
    },
    connected: function(client) {
      if (this.clientsHash[client.userid]) {
        this.clients[this.clients.indexOf(client)] = client;
      } else {
        this.clients.push(client);
      }
      
      this.clientsHash[client.userid] = client;
    },
    disconnected: function(client) {
      this.clients.splice(this.clients.indexOf(client), 1);
      
      delete this.clientsHash[client.userid];
    },
    get: function(userid) {
      return this.clientsHash[userid];
    },
    first: function() {
      if (this.clients.length) {
        return this.clients[0];
      }
    },
    rotate: function() {
      this.clients.push(this.clients.shift());
    },
    isEmpty: function() {
      return this.clients.length <= 0;
    },
    clientIds: function() {
      return _.map(this.clients, function(v) { return v.userid; });
    }
  });
  
  if (this.define && define.amd) {
    // Publish as AMD module
    define(function() {
      return ClientsManager;
    });
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = ClientsManager;
  }
})();
