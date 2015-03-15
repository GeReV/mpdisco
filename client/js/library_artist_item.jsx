var React = require('react/addons');

var DraggableMixin = require('./mixins/draggable_mixin.js');
var EnabledMixin = require('./mixins/enabled_mixin.js');

var LibraryAlbumItem = require('./library_album_item.jsx');

var cx = React.addons.classSet;

var LibraryArtistItem = React.createClass({

    mixins: [DraggableMixin, EnabledMixin],

    statics: {
        getDragType: function() {
            return 'artist';
        }
    },

    getDragItem: function() {
        return this.props.artist;
    },

    getInitialState: function() {
        return {
            albums: this.props.artist.albums || [],
            loaded: false,
            collapsed: true
        };
    },

    render: function() {
        var classes = cx({
            'library-item': true,
            'artist': true,
            'open': !this.state.collapsed
        });

        var treeClasses = cx({
            albums: true,
            tree: true,
            collapsed: this.state.collapsed
        });

        var enabled = this.enabled();

        var albums = this.state.albums.map(function(album) {
            return <LibraryAlbumItem key={album.name} album={album} library={this.props.library} enabled={enabled} />;
        }, this);

        var dragSourceAttributes;

        if (enabled) {
            dragSourceAttributes = this.dragSource();
        }

        return (
            <li className={classes} {...dragSourceAttributes}>
                <span className="name" title={this.props.artist.name} onClick={this.toggleAlbums}>{this.props.artist.name}</span>
                <ul className={treeClasses}>
                    {albums}
                </ul>
            </li>
        );
    },

    toggleAlbums: function(e) {
        if (!this.state.loaded) {

            var promise = this.props.library.fetchAlbums(this.props.artist.name);

            promise
                .done(function(albums) {
                    this.setState({
                        albums: albums,
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

module.exports = LibraryArtistItem;