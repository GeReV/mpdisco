var React = require('./vendor/react/react-with-addons.js');

var DraggableMixin = require('./mixins/draggable_mixin.js');

var LibraryAlbumItem = require('./library_album_item.jsx');

var cx = React.addons.classSet;

var LibraryArtistItem = React.createClass({

    mixins: [DraggableMixin],

    statics: {
        getDragType: function() {
            return 'artist';
        },

        configureDragDrop: function(register) {
            register(this.getDragType(), {
                dragSource: {
                    beginDrag: function(component) {
                        return {
                            item: component.getDragItem()
                        };
                    }
                }
            });
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

    componentWillMount: function() {

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

        var albums = this.state.albums.map(function(album) {
            return <LibraryAlbumItem key={album.name} album={album} library={this.props.library} />;
        }.bind(this));

        return (
            <li className={classes} {...this.dragSourceFor(this.constructor.getDragType())}>
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
    },

    select: function(e) {
        MPDisco.vent.trigger('select:library', this);
    },

    add: function(e) {
        var artistEl = $(e.currentTarget),
            artist = artistEl.data('id');

        MPDisco.command('findadd', ['artist', artist]);

        return false;
    }
});

module.exports = LibraryArtistItem;