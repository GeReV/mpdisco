(function() {
  var Class = require('clah'),
      EventEmitter = require('events').EventEmitter,
      Gravatar = require('./gravatar.js'),
      _ = require('underscore');
      
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
  
  var ClientsManager = Class.extend(_.extend(EventEmitter.prototype, {
    init: function() {
      this.loggedClients = [];
      
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
        
        console.log('client returned ' + client.info.userid);
        
      }
      
      this.clientsHash[client.info.userid] = client;
      
      this.disconnectionTimeouts[client.info.userid] && clearTimeout(this.disconnectionTimeouts[client.info.userid]);
      
      //When this client disconnects
      client.on('disconnect', function() {
    
        that.disconnected.call(that, client);
    
      });
      //client.on disconnect
      
      client.on('identify', function(name) {
        that.performIdentification.call(that, client, name);
      });
      
      if (client.handshake.name) {
        this.performIdentification(client, client.handshake.name);
      }
      
      this.emit('connected', client);
    },
    
    disconnected: function(client) {
      
      console.log('\t socket.io:: client disconnected ' + client.info.userid);
      console.log('client has 5 seconds to return');
      
      this.disconnectionTimeouts[client.info.userid] = setTimeout(function() {
        
        client.broadcast.emit('clientdisconnected', client.info, this.clientsInfo);
        
        this.dropClient(client);
        
        this.emit('disconnected', client);
        
      }.bind(this), 5000);
      
    },
    
    dropClient: function(client) {      
      console.log('Dropped client ' + client.info.userid);
      
      this.loggedClients = _.reject(this.loggedClients, function(c) { return c.info.userid === client.info.userid; });
      
      delete this.clientsHash[client.info.userid];
    },
    
    performIdentification: function(client, name) {
       var that = this;
       
       if (!name) {
         return;
       }
       
       if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(name.trim())) {
         Gravatar.profile(name, false, function(profile) {
           that.identifyClient.call(that, client, profile);
         });
       }else{
         that.identifyClient.call(that, client, {
           displayName: name
         });
       }
    },
    
    identifyClient: function(client, info) { // TODO: Changing logic so that the client queue contains only identified clients might have broken something. Requires testing.
      var index;
      
      if (info.entry && info.entry.length) {
        info = info.entry[0];
      }
      
      client.info = _.extend(client.info, info);
      
      index = _.findIndex(this.loggedClients, function(c) { return c.info.userid === client.info.userid; });
      
      if (index >= 0) {
        this.loggedClients[index] = client;
      } else {
        this.loggedClients.push(client);
      }
      
      client.emit('identify', info);
      
      client.broadcast.emit('clientconnected', client.info, this.clientsInfo);
       
      this.emit('identified', client);
    },
    
    get: function(userid) {
      return this.clientsHash[userid];
    },
    
    first: function() {
      if (this.loggedClients.length) {
        return this.loggedClients[0];
      }
    },
    
    rotate: function() {
      this.loggedClients.push(this.loggedClients.shift());
    },
    
    isEmpty: function() {
      return this.loggedClients.length <= 0;
    },
    
    clientsInfo: function() {
      return _.map(this.loggedClients, function(v) { return v.info; });
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
