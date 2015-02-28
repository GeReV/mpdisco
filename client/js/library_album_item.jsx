var React = require('./vendor/react/react-with-addons.js');

var LibrarySongItem = require('./library_song_item.jsx');

var cx = React.addons.classSet;

var LibraryAlbumItem = React.createClass({
    events: {
        'click > .name': 'toggleSongs',
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
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

        var songs = this.state.songs.map(function(song) {
            return <LibrarySongItem key={song.name} song={song} />;
        });

        return (
            <li className={classes}>
                <a className="name" href="#" title={this.props.album.name} onClick={this.toggleSongs}><img src={this.props.album.cover} alt="Cover" className="cover" /> {this.props.album.name}</a>
                <ol className={treeClasses}>
                    {songs}
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

    toggleSongs: function(e) {
        if (!this.state.loaded) {

            var album = this.props.album;

            var promise = this.props.library.fetchSongs(album.artist.name, album.name);

            promise.done(function(songs) {
                this.setState({
                    songs: songs,
                    loaded: true,
                    collapsed: false
                })
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