import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import cx from 'classnames';
import update from 'react-addons-update';

//var DragDropMixin = require('react-dnd').DragDropMixin;
//var NativeDragItemTypes = require('react-dnd').NativeDragItemTypes;

import actions from '../actions';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library.scss';

import LibraryArtistItem from './library_artist_item.jsx';
import LibraryFileUpload from './library_file_upload.jsx';

@withStyles(styles)
@withEnabled
export default class Library extends Component {

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

    constructor() {
      super();

      this.state = {
          animations: false,
          uploads: [],
          uploading: []
      };
    }

    componentDidMount() {
        //this.props.model.on('updating', this.setUpdatingState);
        actions.fetchLibraryArtists();
    }

    componentDidUpdate() {
        if (this.props.artists && !this.state.animations) {
            // Turn library update animations on.
            this.setState({
              animations: true
            });
        }
    }

    render() {

        //var dropState = this.getDropState(NativeDragItemTypes.FILE);

        const enabled = this.props.enabled;

        const classes = cx({
            'library-updating': this.state.updating,
            //'library-drop': dropState.isDragging,
            //'library-drop-hover': dropState.isHovering,
            'library-disabled': !enabled
        });

        let uploads;
        if (this.state.uploads.length) {
            uploads = (
                <ul className="library-upload">
                    {this.state.uploads.map(file => {
                        var key = file.name;

                        return (
                            <LibraryFileUpload
                                key={key}
                                file={file}
                                onUploadComplete={this.uploadComplete}
                                onUploadFail={this.uploadFail}
                            />
                        );
                    })}
                </ul>
            );
        }

        //<menu>
        //    <input type="text" id="search" className="search" placeholder="Search" />
        //</menu>

        const artists = this.props.library
          .get('artists')
          .toList()
          .map(artist => {
            return (
                <LibraryArtistItem
                    key={artist.get('name')}
                    artist={artist}
                    enabled={enabled}
                    />
            );
          });

        return (
            <section id="library" className={classes}/* {...this.dropTargetFor(NativeDragItemTypes.FILE)}*/>
                <header>Library</header>
                <div className="content">
                    <ReactCSSTransitionGroup component="ul"
                                             className="artists tree"
                                             transitionName="slide"
                                             transitionEnter={this.state.animations}
                                             transitionLeave={this.state.animations}
                                             transitionEnterTimeout={4000}
                                             transitionLeaveTimeout={4000}
                     >
                      {artists}
                    </ReactCSSTransitionGroup>
                    <ReactCSSTransitionGroup component="div"
                                             transitionName="upload"
                                             transitionEnterTimeout={4000}
                                             transitionLeaveTimeout={4000}
                    >
                      {uploads}
                    </ReactCSSTransitionGroup>
                </div>
                <div id="overlay" />
            </section>
        );
    }

    setUpdatingState() {
        // MPD sends the same event when an update starts and finishes, without any other arguments.
        var updating = !this.state.updating;

        if (this.state.updatingTimeout) {
            clearTimeout(this.state.updatingTimeout);
        }

        // Ensures the updating state will turn off after a while if we don't get the second "updating" event.
        const updatingTimeout = setTimeout(() => {
            this.setState({
                updating: false,
                updatingTimeout: null
            });
        }, 5000);

        // Set updating state.
        this.setState({
            updating: updating,
            updatingTimeout: updatingTimeout
        });
    }

    uploadComplete(file) {
        const index = this.state.uploading.indexOf(file);

        if (index >= 0) {
            const stateUpdate = {
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
    }

    uploadAllComplete() {
        this.setState({
            uploads: [],
            uploading: []
        });
    }

    uploadFail(file) {
        console.log('Failed:', file);
    }
}
