var React = require('react/addons');

var DraggableMixin = require('./../mixins/draggable_mixin.js');
var EnabledMixin = require('./../mixins/enabled_mixin.js');

var LibrarySongItem = require('./library_song_item.jsx');

var cx = React.addons.classSet;

var MPDiscoController = require('./../mpdisco_controller.js');

var LibraryAlbumItem = React.createClass({

    mixins: [DraggableMixin, EnabledMixin],

    propTypes: {
        controller: React.PropTypes.instanceOf(MPDiscoController).isRequired
    },

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

        var album = this.props.album;

        var songs = (album.songs || []).map(function(song) {
            return <LibrarySongItem
                key={song.title}
                song={song}
                enabled={enabled} />;
        });

        var dragSourceAttributes;

        if (enabled) {
            dragSourceAttributes = this.dragSource();
        }

        return (
            <li className={classes} {...dragSourceAttributes}>
                <span className="name" title={album.name} onClick={this.toggleSongs}><img src={album.cover} alt="Cover" className="cover" /> {album.name}</span>
                <ol className={treeClasses}>
                    {songs}
                </ol>
            </li>
        );
    },

    toggleSongs: function(e) {
        if (!this.state.loaded) {

            var album = this.props.album;

            this.props.controller.libraryListSongs(album.artist, album);

            this.setState({
                loaded: true,
                collapsed: false
            });
        } else {
            this.setState({
                collapsed: !this.state.collapsed
            });
        }

        e.preventDefault();
    }
});

module.exports = LibraryAlbumItem;