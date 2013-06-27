(function() {
  var Class = require('clah'),
      EventEmitter = require('events').EventEmitter,
      Gravatar = require('./gravatar.js'),
      _ = require('underscore');
  
  var ClientsManager = Class.extend(_.extend(EventEmitter.prototype, {
    init: function() {
      this.clients = [];
      
      this.clientsHash = {};
      
      this.disconnectionTimeouts = {};
    },
    connected: function(client) {
      client.info = {
        userid: client.handshake.sessionID
      };
      
      var that = this,
          prevClient = this.clientsHash[client.info.userid],
          index;
      
      //Useful to know when someone connects
      console.log('\t socket.io:: client ' + client.info.userid + ' connected');
      
      if (prevClient) {
        client.info = prevClient.info;
        
        index = _.find(this.clients, function(c) { return c.info.userid === client.info.userid; });
        
        this.clients[index] = client;
        
        console.log('client returned ' + client.info.userid);
        
      } else {
        
        this.clients.push(client);
        
      }
      
      this.clientsHash[client.info.userid] = client;
      
      this.disconnectionTimeouts[client.info.userid] && clearTimeout(this.disconnectionTimeouts[client.info.userid]);
      
      //When this client disconnects
      client.on('disconnect', function() {
    
        that.disconnected.call(that, client);
    
      });
      //client.on disconnect
      
      client.on('identify', function(name) {
         if (!name) {
           return;
         }
         
         if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(name.trim())) {
           Gravatar.profile(name, false, function(profile) {
             that.identifyClient(client, profile);
           });
         }else{
           that.identifyClient(client, {
             displayName: name
           });
         }
      });
      
      this.emit('connected', client);
    },
    disconnected: function(client) {
      
      console.log('\t socket.io:: client disconnected ' + client.info.userid);
      console.log('client has 5 seconds to return');
      
      this.disconnectionTimeouts[client.info.userid] = setTimeout(function() {
        
        client.broadcast.emit('clientdisconnected', client.info.userid);
        
        this.dropClient(client);
        
        this.emit('disconnected', client);
        
      }.bind(this), 5000);
      
    },
    dropClient: function(client) {      
      var index = _.find(this.clients, function(c) { return c.info.userid === client.info.userid; });
      
      console.log('Dropped client ' + client.info.userid);
      
      this.clients.splice(index, 1);
      
      delete this.clientsHash[client.info.userid];
    },
    identifyClient: function(client, info) {
      if (info.entry && info.entry.length) {
        info = info.entry[0];
      }
      
      client.info = _.extend(client.info, info);
      
      client.emit('identify', info);
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
    clientsInfo: function() {
      return _.map(this.clients, function(v) { return v.info; });
    }
  }));
  
  var ClientsManagerSingleton = function() {
    if ( ClientsManagerSingleton.prototype._singletonInstance ) {
      return ClientsManagerSingleton.prototype._singletonInstance;
    }
    
    return (ClientsManagerSingleton.prototype._singletonInstance = new ClientsManager); 
  };
  
  if (this.define && define.amd) {
    // Publish as AMD module
    define(function() {
      return ClientsManagerSingleton;
    });
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = ClientsManagerSingleton;
  }
})();
