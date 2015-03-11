var React = require('react/addons');

var DraggableMixin = require('./mixins/draggable_mixin.js');
var EnabledMixin = require('./mixins/enabled_mixin.js');

var LibrarySongItem = require('./library_song_item.jsx');

var cx = React.addons.classSet;

var LibraryAlbumItem = React.createClass({

    mixins: [DraggableMixin, EnabledMixin],

    statics: {
        getDragType: function() {
            return 'album';
        }
    },

    getDragItem: function() {
        return this.props.album;
    },

    getInitialState: function() {
        return {
            songs: this.props.album.songs || [],
            loaded: false,
            collapsed: true
        };
    },

    render: function() {
        var classes = cx({
            'library-item': true,
            'album': true,
            'open': !this.state.collapsed
        });

        var treeClasses = cx({
            'songs': true,
            'tree': true,
            'collapsed': this.state.collapsed
        });

        var enabled = this.enabled();

        var songs = this.state.songs.map(function(song) {
            return <LibrarySongItem key={song.title} song={song} enabled={enabled} />;
        });

        var dragSourceAttributes;

        if (enabled) {
            dragSourceAttributes = this.dragSource();
        }

        return (
            <li className={classes} {...dragSourceAttributes}>
                <span className="name" title={this.props.album.name} onClick={this.toggleSongs}><img src={this.props.album.cover} alt="Cover" className="cover" /> {this.props.album.name}</span>
                <ol className={treeClasses}>
                    {songs}
                </ol>
            </li>
        );
    },

    toggleSongs: function(e) {
        if (!this.state.loaded) {

            var album = this.props.album;

            var promise = this.props.library.fetchSongs(album.artist.name, album.name);

            if (!promise) {
                return;
            }

            promise.done(function(songs) {
                this.setState({
                    songs: songs,
                    loaded: true,
                    collapsed: false
                });
            }.bind(this));
        } else {
            this.setState({
                collapsed: !this.state.collapsed
            });
        }

        e.preventDefault();
    }
});

module.exports = LibraryAlbumItem;