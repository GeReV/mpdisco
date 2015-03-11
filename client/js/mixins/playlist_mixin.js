var DragDropMixin = require('react-dnd').DragDropMixin;

var accepts = ['artist', 'album', 'song'];

var PlaylistMixin = {
    mixins: [
        DragDropMixin
    ],

    statics: {
        configureDragDrop: function(register) {
            accepts.forEach(function(itemType) {
                register(itemType, {
                    dropTarget: {
                        acceptDrop: function(component, item) {
                            component.props.model.addItem(itemType, item);
                        }
                    }
                });
            });
        }
    },

    getInitialState: function() {
        return {
            animations: false,
            items: [],
            selectedItems: [],
            playingItem: null
        };
    },

    componentWillMount: function() {
        this.props.player.on('song', function(song) {
            this.setState({
                playingItemId: song.id
            });
        }.bind(this));

        this.props.player.on('state', function(state) {
            this.setState({
                status: state
            });
        }.bind(this));

        this.props.model.on('playlist', function(playlist) {
            this.setState({
                items: playlist || []
            });
        }.bind(this));

        this.props.model.fetchPlaylist();
    },

    componentDidMount: function() {
        // Turn library update animations on.
        this.setState({
            animations: true
        });
    },

    itemPlayed: function(item) {
        this.props.model.play(item.id);
    },

    itemRemoved: function(items) {
        this.props.model.removeItems(items || this.state.selectedItems);
    },

    itemSelected: function(items) {
        this.setState({
            selectedItems: items
        });
    },

    itemsReordered: function(items) {
        this.setState({
            items: items
        });
        this.props.model.reorderItems(items);
    },

    repeat: function(repeat, single) {
        if (repeat && single) {
            // Both on, turn both off.
            this.props.player.toggleRepeat(0, 0);
        } else if (repeat) {
            // Repeat on, turn single on.
            this.props.player.toggleRepeat(1, 1);
        } else {
            // Both off, turn repeat on.
            this.props.player.toggleRepeat(1, 0);
        }
    },

    shuffle: function(shuffle) {
        this.props.player.toggleShuffle(shuffle);
    }
};

module.exports = {
    PlaylistMixin: PlaylistMixin,
    accepts: accepts
};