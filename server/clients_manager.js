var Class = require('clah'),
    EventEmitter = require('events').EventEmitter,
    uuid = require('node-uuid'),
    util = require('util'),
    _ = require('underscore');

var Gravatar = require('./gravatar.js');

var EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

_.findIndex = function(obj, iterator, context) {
  var result = -1;
  _.any(obj, function(value, index, list) {
      if(iterator.call(context, value, index, list)) {
          result = index;
          return true;
      }
  });
  return result;
};

var ClientsManager = Class.extend({
  init: function() {
    this.loggedClients = [];

    this.clientsHash = {};

    this.disconnectionTimeouts = {};
  },

  connected: function(client) {
    var info = client.info = {
      userid: uuid.v4()
    };

    var prevClient = this.clientsHash[info.userid];

    //Useful to know when someone connects
    console.log('\t socket.io:: client ' + info.userid + ' connected');

    if (prevClient) {
      client.info = prevClient.info;

      console.log('client returned ' + info.userid);

    }

    this.clientsHash[info.userid] = client;

    if (this.disconnectionTimeouts[info.userid]) {
      clearTimeout(this.disconnectionTimeouts[info.userid]);
    }

    //When this client disconnects
    client.on('disconnect', function() {
      this.disconnected(client);
    }.bind(this));

    client.on('identify', function(name) {
      this.performIdentification(client, name);
    }.bind(this));

    client.on('clientslist', function() {
      this.sendClientsList(client);
    }.bind(this));

    if (client.handshake.name) {
      this.performIdentification(client, client.handshake.name);
    }

    this.emit('connected', client);
  },

  disconnected: function(client) {

    var info = client.info;

    console.log('\t socket.io:: client disconnected ' + info.userid);
    console.log('client has 5 seconds to return');

    this.disconnectionTimeouts[info.userid] = setTimeout(function() {

      this.dropClient(client);

      client.broadcast.emit('clientdisconnected', info/*, this.clientsInfo*/);

      this.emit('disconnected', client);

    }.bind(this), 5000);

  },

  dropClient: function(client) {
    var info = client.info;

    console.log('Dropped client ' + info.userid);

    this.loggedClients = _.reject(this.loggedClients, function(c) { return c.info.userid === info.userid; });

    delete this.clientsHash[info.userid];
  },

  performIdentification: function(client, name) {
     if (!name) {
       return;
     }

     if (EMAIL_REGEX.test(name.trim())) {
       Gravatar.profile(name, false, function(profile) {
         this.identifyClient(client, profile);
       }.bind(this));
     }else{
       this.identifyClient(client, {
         displayName: name
       });
     }
  },

  identifyClient: function(client, info) { // TODO: Changing logic so that the client queue contains only identified clients might have broken something. Requires testing.
    var index;

    if (info.entry && info.entry.length) {
      info = info.entry[0];
    }

    client.info = _.extend({ logged: true }, client.info, info);

    index = _.findIndex(this.loggedClients, function(c) { return c.info.userid === client.info.userid; });

    if (index >= 0) {
      this.loggedClients[index] = client;
    } else {
      this.loggedClients.push(client);
    }

    client.emit('identify', client.info);

    this.sendClientsList(client.broadcast);

    client.broadcast.emit('clientconnected', client.info/*, this.clientsInfo*/);

    this.emit('identified', client);
  },

  sendClientsList: function(client) {
    client.emit('clientslist', this.clientsInfo(), client.info);
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
    return _.map(this.clientsHash, function(v) {
      return v.info;
    });
  }
});

_.extend(ClientsManager.prototype, EventEmitter.prototype);
  
var ClientsManagerSingleton = function() {
  if ( ClientsManagerSingleton.prototype._singletonInstance ) {
    return ClientsManagerSingleton.prototype._singletonInstance;
  }

  ClientsManagerSingleton.prototype._singletonInstance = new ClientsManager();

  return ClientsManagerSingleton.prototype._singletonInstance;
};
  
module.exports = {
  instance: ClientsManagerSingleton
};
