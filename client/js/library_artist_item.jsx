var React = require('react/addons');

var DraggableMixin = require('./mixins/draggable_mixin.js');
var EnabledMixin = require('./mixins/enabled_mixin.js');

var LibraryAlbumItem = require('./library_album_item.jsx');

var cx = React.addons.classSet;

var MPDiscoController = require('./mpdisco_controller.js');

var LibraryArtistItem = React.createClass({

    mixins: [DraggableMixin, EnabledMixin],

    propTypes: {
        controller: React.PropTypes.instanceOf(MPDiscoController).isRequired
    },

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

        var artist = this.props.artist;

        var albums = (artist.albums || []).map(function(album) {
            return <LibraryAlbumItem
                key={album.name}
                album={album}
                controller={this.props.controller}
                enabled={enabled} />;
        }, this);

        var dragSourceAttributes;

        if (enabled) {
            dragSourceAttributes = this.dragSource();
        }

        return (
            <li className={classes} {...dragSourceAttributes}>
                <span className="name" title={artist.name} onClick={this.toggleAlbums}>{artist.name}</span>
                <ul className={treeClasses}>
                    {albums}
                </ul>
            </li>
        );
    },

    toggleAlbums: function(e) {
        if (!this.state.loaded) {

            this.props.controller.libraryListAlbums(this.props.artist);

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

module.exports = LibraryArtistItem;