var Baobab = require('baobab');
var _ = require('underscore');

var LibraryMerger = require('./library_merger.js');

var tree = new Baobab({
    me: null,
    status: {
        state: 'stop'
    },
    artists: [],
    playlist: [],
    listeners: [],
    currentsong: {
        title: '',
        artist: '',
        album: '',
        time: 0
    },
    cover: null
});

function init(network) {
    this.network = network;

    this.tree = tree;

    this.bindPlaylist(
        network,
        this.tree.select('playlist'));

    this.bindListeners(
        network,
        this.tree.select('listeners'),
        this.tree.select('me'));

    this.bindPlayer(
        network,
        this.tree.select('status'),
        this.tree.select('currentsong'),
        this.tree.select('cover'));

    this.bindLibrary(
        network,
        this.tree.select('artists'));
}

_.extend(init, {
    bindPlaylist: function(network, cursor) {
        function update() {
            network.command('playlistinfo');
        }

        network.on('playlistinfo', function(playlist) {
            cursor.edit(playlist);
        });

        network.on('update:playlist', update);

        update();
    },

    bindListeners: function(network, listenersCursor, meCursor) {
        function update() {
            network.send('clientslist');
        }

        network.on('clientslist', function(clients, me) {
            listenersCursor.edit(clients);
            meCursor.edit(me);
        });

        network.on('clientdisconnected', update);

        update();
    },

    bindPlayer: function(network, statusCursor, currentSongCursor, coverCursor) {
        function update() {
            network.command('currentsong');
            network.command('status');
        }

        network.on('status', function(state) {
            statusCursor.edit(state);
        });

        network.on('currentsong', function(song) {
            currentSongCursor.edit(song);
        });

        network.on('coverart', function(res) {
            coverCursor.edit(res.url);
        });

        network.on('update:player', update);
        network.on('playid', update);
        network.on('repeat', update);
        network.on('random', update);

        update();
    },

    bindLibrary: function(network, cursor) {
        function update() {
            network.command('list', 'artist');
        }

        network.on('update:database', update);

        this.libraryMerger = new LibraryMerger(network, cursor);

        update();
    }
});

module.exports = {
    init: init.bind(init),
    tree: tree
};