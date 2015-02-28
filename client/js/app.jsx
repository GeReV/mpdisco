var _ = require('./vendor/underscore/underscore.js');
var React = require('./vendor/react/react-with-addons.js');
var Network = require('./network.js');
var MPDisco = require('./mpdisco.jsx');

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

//MPDisco.ErrorView = Marionette.ItemView.extend({
//  className: 'error',
//
//  template: 'error',
//
//  model: new MPDisco.Error(),
//
//  modelEvents: {
//    change: 'show'
//  },
//
//  socketEvents: {
//    error: 'show'
//  },
//
//  events: {
//    'click .close': 'hide'
//  },
//
//  show: function() {
//    this.render();
//
//    this.$el.addClass('shown');
//  },
//
//  hide: function() {
//    this.$el.removeClass('shown');
//  }
//});

//MPDisco.State = MPDisco.Model.extend({
//    socketEvents: {
//        status: 'set'
//    }
//});
//
//MPDisco.state = new MPDisco.State();

//if (Backbone.history) {
//    Backbone.history.start();
//}

//MPDisco.mode = MPDisco.module('MasterMode').Mode;

//this.layout = new MPDisco.Layout();
//
//this.container.show(this.layout);
//
//this.layout.player.show(new MPDisco.mode.player());
//
//this.layout.user.show(new MPDisco.mode.user());
//
//this.layout.scrubber.show(new MPDisco.mode.scrubber());
//
//this.layout.playlist.show(new MPDisco.mode.playlist());
//
//this.layout.listeners.show(new MPDisco.mode.listeners());
//
//this.layout.library.show(new MPDisco.mode.library());
//
//this.layout.error.show(new MPDisco.ErrorView());

MPDisco.network.command('status');

window.MPDisco = MPDisco;

React.render(<MPDisco />, document.body);