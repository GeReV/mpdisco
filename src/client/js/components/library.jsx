var React = require('react/addons');
var _ = require('lodash');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var cx = React.addons.classSet;
var update = React.addons.update;

//var DragDropMixin = require('react-dnd').DragDropMixin;
//var NativeDragItemTypes = require('react-dnd').NativeDragItemTypes;

var EnabledMixin = require('./../mixins/enabled_mixin.js');

var LibraryArtistItem = require('./library_artist_item.jsx');
var LibraryFileUpload = require('./library_file_upload.jsx');

var MPDiscoController = require('./../mpdisco_controller.js');

var tree = require('./../mpdisco_model.js').tree;

var Library = React.createClass({

    mixins: [/*DragDropMixin,*/ EnabledMixin, tree.mixin],

    propTypes: {
        controller: React.PropTypes.instanceOf(MPDiscoController).isRequired
    },

    cursors: {
        artists: ['artists']
    },

    //statics: {
    //    configureDragDrop: function(register) {
    //        register(NativeDragItemTypes.FILE, {
    //            dropTarget: {
    //                acceptDrop: function(component, item) {
    //                    if (!item) {
    //                        return;
    //                    }
    //
    //                    if (_.isArray(item.files)) {
    //                        component.setState({
    //                            uploads: item.files,    // These will be rendered.
    //                            uploading: item.files   // These will be used to keep track of progress.
    //                        });
    //                    }
    //                }
    //            }
    //        });
    //    }
    //},

    getInitialState: function() {
        return {
            animations: false,
            uploads: [],
            uploading: []
        };
    },

    componentDidMount: function() {
        //this.props.model.on('updating', this.setUpdatingState);
    },

    componentDidUpdate: function() {
        if (this.cursors.artists.get() && !this.state.animations) {
            // Turn library update animations on.
            this.setState({
                animations: true
            });
        }
    },

    render: function() {

        //var dropState = this.getDropState(NativeDragItemTypes.FILE);

        var enabled = this.enabled();

        var classes = cx({
            'library-updating': this.state.updating,
            //'library-drop': dropState.isDragging,
            //'library-drop-hover': dropState.isHovering,
            'library-disabled': !enabled
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

        var artists = this.cursors.artists.get();

        //<menu>
        //    <input type="text" id="search" className="search" placeholder="Search" />
        //</menu>

        return (
            <section id="library" className={classes}/* {...this.dropTargetFor(NativeDragItemTypes.FILE)}*/>
                <header>Library</header>
                <div className="content">
                    <ReactCSSTransitionGroup component="ul" className="artists tree" transitionName="slide" transitionEnter={this.state.animations} transitionLeave={this.state.animations}>
                        {artists.map(function(artist) {
                            return (
                                <LibraryArtistItem
                                    key={artist.name}
                                    artist={artist}
                                    controller={this.props.controller}
                                    enabled={enabled}
                                    />
                            );
                        }, this)}
                    </ReactCSSTransitionGroup>
                    <ReactCSSTransitionGroup component="div" transitionName="upload">
                        {uploads}
                    </ReactCSSTransitionGroup>
                </div>
                <div id="overlay" />
            </section>
        );
    },

    setUpdatingState: function() {
        // MPD sends the same event when an update starts and finishes, without any other arguments.
        var updating = !this.state.updating;

        if (this.state.updatingTimeout) {
            clearTimeout(this.state.updatingTimeout);
        }

        // Ensures the updating state will turn off after a while if we don't get the second "updating" event.
        var updatingTimeout = setTimeout(function() {
            this.setState({
                updating: false,
                updatingTimeout: null
            });
        }.bind(this), 5000);

        // Set updating state.
        this.setState({
            updating: updating,
            updatingTimeout: updatingTimeout
        });
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
