var _ = require('underscore');

var MPDiscoController = function(network) {
    this.network = network;
};

_.extend(MPDiscoController.prototype, {
    toggleShuffle: function(random) {
        this.network.command('random', random);
    },
    toggleRepeat: function(repeat, single) {
        this.network.command('repeat', repeat);
        this.network.command('single', single);
    },
    seek: function(id, seconds) {
        this.network.command('seekid', id, seconds);
    },
    play: function(id) {
        if (id) {
            this.network.command('playid', id);
        }
        this.network.command('play');
    },
    stop: function() {
        this.network.command('stop');
    },
    pause: function(pause) {
        if (pause === undefined) {
            pause = true;
        }
        this.network.command('pause', (pause ? 1 : 0));
    },
    next: function() {
        this.network.command('next');
    },
    previous: function() {
        this.network.command('previous');
    },

    playlistRemoveItems: function(items) {
        var commands = items.map(function(item) {
            return {
                command: 'deleteid',
                args: [item.id]
            };
        });

        this.network.commands(commands);
    },

    playlistAddItem: function(itemType, item) {
        var network = this.network;

        switch (itemType) {
            case 'artist':
                network.command('findadd', 'artist', item.name);
                break;
            case 'album':
                network.command('findadd', 'artist', item.artist.name, 'album', item.name);
                break;
            case 'song':
                network.command('findadd', 'artist', item.artist.name, 'album', item.album.name, 'title', item.title);
                break;
        }
    },

    playlistReorderItems: function(items) {
        var commands = items.map(function(item, i) {
            return {
                command: 'moveid',
                args: [item.id, i]
            };
        });

        this.network.commands(commands);
    },

    listenerIdentify: function(name) {
        this.network.send('identify', name);
    },

    libraryListAlbums: function(artist) {
        this.network.command('list', ['album', artist.name]);
    },

    libraryListSongs: function(artist, album) {
        this.network.command('find', ['artist', artist.name, 'album', album.name]);
    }
});

module.exports = MPDiscoController;