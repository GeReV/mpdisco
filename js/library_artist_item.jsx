var React = require('./vendor/react/react.js');

var LibraryAlbumItem = require('./library_album_item.jsx');

var LibraryArtistItem = React.createClass({

    events: {
        'click > .name': 'toggleAlbums',
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
    },

    getInitialState: function() {
        return {
            albums: []
        };
    },

    componentWillMount: function() {

    },

    render: function() {
        return (
            <li className="library-item artist">
                <a class="name" href="#" data-id={this.props.artist.name} title={this.props.artist.name} onClick={this.toggleAlbums}>{this.props.artist.name}</a>
                <ul class="albums tree collapsed">
                    {this.state.albums.map(function(album) {
                        return <LibraryAlbumItem album={album} />;
                    })}
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
        //this.ui.albums.toggleClass('collapsed');

        if (!this.loaded) {

            MPDisco.command('list', ['album', this.props.artist.name]);

            this.loaded = true;
        }

        return false;
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