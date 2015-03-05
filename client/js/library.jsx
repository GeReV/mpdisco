var React = require('react/addons');
var _ = require('underscore');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var cx = React.addons.classSet;
var update = React.addons.update;

var DragDropMixin = require('react-dnd').DragDropMixin;
var NativeDragItemTypes = require('react-dnd').NativeDragItemTypes;

var LibraryArtistItem = require('./library_artist_item.jsx');
var LibraryFileUpload = require('./library_file_upload.jsx');

var Library = React.createClass({

    mixins: [DragDropMixin],

    statics: {
        configureDragDrop: function(register) {
            register(NativeDragItemTypes.FILE, {
                dropTarget: {
                    acceptDrop: function(component, item) {
                        if (!item) {
                            return;
                        }

                        if (_.isArray(item.files)) {
                            component.setState({
                                uploads: item.files,    // These will be rendered.
                                uploading: item.files   // These will be used to keep track of progress.
                            });
                        }
                    }
                }
            });
        }
    },

    getInitialState: function() {
        return {
            artists: this.props.model.artists || [],
            uploads: [],
            uploading: []
        };
    },

    componentWillMount: function() {
        this.props.model.fetchArtists()
            .done(function(artists) {
                this.setState({
                    artists: artists
                });
            }.bind(this));
    },

    render: function() {

        var dropState = this.getDropState(NativeDragItemTypes.FILE);

        var classes = cx({
            'library-drop': dropState.isDragging,
            'library-drop-hover': dropState.isHovering
        });

        var uploads;
        if (this.state.uploads.length) {
            uploads = (
                <ul className="library-upload">
                    {this.state.uploads.map(function(file) {
                        var key = file.name;

                        return (
                            <LibraryFileUpload
                                key={key}
                                file={file}
                                onUploadComplete={this.uploadComplete}
                                onUploadFail={this.uploadFail}
                            />
                        );
                    }.bind(this))}
                </ul>
            );
        }

        return (
            <section id="library" className={classes} {...this.dropTargetFor(NativeDragItemTypes.FILE)}>
                <header>Library</header>
                <div className="content">
                    <menu>
                        <input type="text" id="search" className="search" placeholder="Search" />
                    </menu>
                    <ul className="artists tree">
                        {this.state.artists.map(function(artist) {
                            return (
                                <LibraryArtistItem
                                    key={artist.name}
                                    artist={artist}
                                    library={this.props.model}
                                    />
                            );
                        }.bind(this))}
                    </ul>
                    <ReactCSSTransitionGroup component="div" transitionName="upload">
                        {uploads}
                    </ReactCSSTransitionGroup>
                </div>
                <div id="overlay" />
            </section>
        );
    },

    uploadComplete: function(file) {
        var index = this.state.uploading.indexOf(file);

        if (index >= 0) {
            var stateUpdate = {
                uploading: {
                    $splice: [
                        [index, 1]
                    ]
                }
            };

            this.setState(update(this.state, stateUpdate));
        }

        if (this.state.uploading.length <= 0) {
            this.uploadAllComplete();
        }
    },

    uploadAllComplete: function() {
        this.setState({
            uploads: [],
            uploading: []
        });
    },

    uploadFail: function(file) {
        console.log('Failed:', upload);
    }
});

module.exports = Library;