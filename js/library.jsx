var React = require('./vendor/react/react.js');

var LibraryArtistItem = require('./library_artist_item.jsx');

var Library = React.createClass({
    getInitialState: function() {
        return {
            artists: []
        };
    },

    componentWillMount: function() {
        MPDisco.network.on('list:artist', function(res) {
            var artists = res.data.map(function(item) {
                return { name: item.artist };
            });

            this.setState({
                artists: artists
            });
        }.bind(this));

        MPDisco.command('list', 'artist');

        //this.listenTo(MPDisco.vent, 'select:library', this.select);
    },

    render: function() {
        return (
            <div id="library">
                <header>Library</header>
                <menu>
                    <input type="text" id="search" className="search" placeholder="Search" />
                </menu>
                <div className="content">
                    <ul className="artists tree">
                        {this.state.artists.map(function(artist) {
                            return <LibraryArtistItem key={artist.name} artist={artist} />;
                        })}
                    </ul>
                    <ul className="upload"></ul>
                    <input type="file" id="fileupload" nameName="files[]" data-url="upload" multiple="multiple" />
                </div>
                <div id="overlay" />
            </div>
        );
    },

    //onRender: function() {
    //    var that = this;
    //
    //    this.ui.files.fileupload({
    //        autoUpload: true,
    //        sequentialUploads: true
    //    });
    //},

    select: function(view) {
        this.$('li').removeClass('selected');

        view.$el.addClass('selected');
    },

    onShow: function() {
        var that = this;

        $(document).on('dragenter.library', function() {
            that.$el.addClass('library-drop');
        });
    },
    onClose: function() {
        $(document).off('dragover.library');
    },
    drop: function() {
        this.clearDrop();
    },
    clearDrop: function() {
        this.$el.removeClass('library-drop');
    },
    startProgress: function() {
        this.$el.addClass('uploading');
    },
    finishProgress: function(e, data) {
        data.context.addClass('finished');

        if (!this.ui.upload.children().not('.finished').length) {
            // Finished upload batch.

            this.ui.upload.empty();

            this.$el.removeClass('library-drop uploading');

            MPDisco.command('update');
        }
    },
    createProgress: function(e, data) {
        if (data.files.length) {
            data.context = $('<li><span class="filename">' + data.files[0].name + '</span><span class="progress-bar"><span class="progress"></span></span></li>').appendTo(this.ui.upload);
        }
    },
    showProgress: function(e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10),
            itemTop = data.context.position().top,
            itemHeight = data.context.height(),
            height = this.ui.upload.height();

        if (itemTop > height) {
            this.ui.upload.prop('scrollTop', itemTop + itemHeight - height);
        }

        data.context.find('.progress').css('width', progress + '%');
    },
    failProgress: function(e, data) {
        data.context.addClass('failed');
    }
});

module.exports = Library;