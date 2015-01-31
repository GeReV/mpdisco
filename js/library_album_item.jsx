var React = require('./vendor/react/react.js');

var LibrarySongItem = require('./library_song_item.jsx');

var LibraryAlbumItem = React.createClass({
    events: {
        'click > .name': 'toggleSongs',
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
    },

    getInitialState: function() {
        return {
            songs: []
        };
    },

    render: function() {
        return (
            <li className="library-item album">
                <a className="name" href="#" data-id={this.props.album.name} title={this.props.album.name}><img src={this.props.album.cover} alt="Cover" className="cover" /> {this.props.album.name}</a>
                <ol class="songs tree collapsed">
                    {this.props.album.songs.map(function(song) {
                        return <LibrarySongItem song={song} />;
                    })}
                </ol>
            </li>
        );
    },

    onDomRefresh: function() {
        this.$el.attr('data-id', this.model.get('album'));

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

    toggleSongs: function(e) {
        var albumEl = $(e.currentTarget).toggleClass('open'),
            artistEl = albumEl.closest('.artist').find('.name'),
            album = albumEl.data('id'),
            artist = artistEl.data('id');

        this.ui.songs.toggleClass('collapsed');

        if (!this.loaded) {

            this.collection.filter = artist + ' ' + album;

            MPDisco.command('find', ['artist', artist, 'album', album]);

            this.loaded = true;
        }

        return false;
    },
    select: function(e) {
        MPDisco.vent.trigger('select:library', this);
    },
    add: function(e) {
        var albumEl = $(e.currentTarget),
            artistEl = albumEl.closest('.artist').find('.name'),
            album = albumEl.data('id'),
            artist = artistEl.data('id');

        MPDisco.command('findadd', ['artist', artist, 'album', album]);

        return false;
    },

    dragstart: function(e, ui) {
        var album = this.model.get('album'),
            artist = this.$el.closest('.artist').data('id');

        $(ui.helper).data('model', {
            album: album,
            artist: artist
        });

        e.stopPropagation();
    }
});

module.exports = LibraryAlbumItem;