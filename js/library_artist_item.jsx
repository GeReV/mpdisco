var React = require('./vendor/react/react-with-addons.js');

var LibraryAlbumItem = require('./library_album_item.jsx');

var cx = React.addons.classSet;

var LibraryArtistItem = React.createClass({

    events: {
        'click > .name': 'toggleAlbums',
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
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
            <li className={classes}>
                <a className="name" href="#" title={this.props.artist.name} onClick={this.toggleAlbums}>{this.props.artist.name}</a>
                <ul className={treeClasses}>
                    {albums}
                </ul>
            </li>
        );
    },

    onDomRefresh: function() {
        this.$el.attr('data-id', this.model.get('artist'));

        this.$el.draggable({
            appendTo: '.library',
            distance: 2,
            scope: 'media',
            helper: function(e) {
                var item = $(e.currentTarget);

                return $('<div/>', {
                    'class': item.attr('class')
                }).html(item.html()).eq(0);
            }
        });
    },

    loaded: false,

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
    },

    dragstart: function(e, ui) {
        var artist = this.model.get('artist');

        $(ui.helper).data('model', {
            artist: artist
        });

        e.stopPropagation();
    }
});

module.exports = LibraryArtistItem;