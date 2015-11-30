var EventEmitter = require('events').EventEmitter,
    debug = require('debug')('mpdisco:clients_manager'),
    uuid = require('node-uuid'),
    util = require('util'),
    _ = require('lodash');

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

class ClientsManager extends EventEmitter {
  constructor() {
    super();

    this.loggedClients = [];

    this.clientsHash = {};

    this.disconnectionTimeouts = {};
  }

  connected(client) {
    var session = client.handshake.session;

    if (!session.userid) {
      session.userid = uuid.v4();
      session.save();
    }

    var info = client.info = {
      userid: client.handshake.session.userid
    };

    var prevClient = this.clientsHash[info.userid];

    //Useful to know when someone connects
    debug('Client connected: %s', info.userid);

    if (prevClient) {
      client.info = prevClient.info;

      debug('Client returned: %s', info.userid);

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
  }

  disconnected(client) {

    var info = client.info;

    debug('Client disconnected: %s', info.userid);

    debug('Client has 5 seconds to return before dropping...');

    this.disconnectionTimeouts[info.userid] = setTimeout(function() {

      this.dropClient(client);

      client.broadcast.emit('clientdisconnected', info/*, this.clientsInfo*/);

      this.emit('disconnected', client);

    }.bind(this), 5000);

  }

  dropClient(client) {
    var info = client.info;

    debug('Dropped client: %s', info.userid);

    this.loggedClients = _.reject(this.loggedClients, function(c) { return c.info.userid === info.userid; });

    delete this.clientsHash[info.userid];
  }

  performIdentification(client, name) {
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
  }

  identifyClient(client, profile) { // TODO: Changing logic so that the client queue contains only identified clients might have broken something. Requires testing.
    var index;

    if (profile.entry && profile.entry.length) {
      profile = profile.entry[0];
    }

    client.info = _.extend({ logged: true }, client.info, profile);

    index = _.findIndex(this.loggedClients, function(c) { return c.info.userid === client.info.userid; });

    if (index >= 0) {
      this.loggedClients[index] = client;
    } else {
      this.loggedClients.push(client);
    }

    debug('Client %s identified as %s.', client.info.userid, client.info.displayName);

    client.emit('identify', client.info);
    client.broadcast.emit('clientidentified', client.info/*, this.clientsInfo*/);

    this.sendClientsList(client.broadcast);
    this.sendClientsList(client);

    this.emit('identified', client);
  }

  sendClientsList(client) {
    client.emit('clientslist', this.clientsInfo(), client.info);
  }

  get(userid) {
    return this.clientsHash[userid];
  }

  first() {
    if (this.loggedClients.length) {
      return this.loggedClients[0];
    }
  }

  rotate() {
    this.loggedClients.push(this.loggedClients.shift());
  }

  isEmpty() {
    return this.loggedClients.length <= 0;
  }

  clientsInfo() {
    return _.map(this.clientsHash, function(v) {
      return v.info;
    }) || [];
  }
}

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
