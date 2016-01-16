import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import cx from 'classnames';
import update from 'react-addons-update';
import { DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import actions from '../actions';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library.scss';

import LibraryArtistItem from './library_artist_item.jsx';
import LibraryFileUpload from './library_file_upload.jsx';

const uploadSpec = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      // If you want, you can check whether some nested
      // target already handled drop
      return;
    }

    // Obtain the dragged item
    const item = monitor.getItem();

    if (!item) {
      return;
    }

    if (_.isArray(item.files)) {
      component.setState({
        uploads: item.files,    // These will be rendered.
        uploading: item.files   // These will be used to keep track of progress.
      });
    }

    // You can also do nothing and return a drop result,
    // which will be available as monitor.getDropResult()
    // in the drag source's endDrag() method
    return { moved: true };
  }
};

@withStyles(styles)
@withEnabled
@DropTarget(NativeTypes.FILE, uploadSpec, (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDropTarget: connect.dropTarget(),
  // You can ask the monitor about the current drag state:
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
export default class Library extends Component {

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

      const { enabled, isOver, canDrop, connectDropTarget } = this.props;

      const classes = cx({
        'library-updating': this.state.updating,
        'library-drop': canDrop,
        'library-drop-hover': isOver,
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
                  onUploadComplete={this.uploadComplete.bind(this)}
                  onUploadFail={this.uploadFail.bind(this)}
                />
              );
            })}
          </ul>
        );
      }

      //<menu>
      //    <input type="text" id="search" className="search" placeholder="Search" />
      //</menu>

      return connectDropTarget(
        <section id="library" className={classes}/* {...this.dropTargetFor(NativeDragItemTypes.FILE)}*/>
          <header>Library</header>
          <div className="content">
            {this.artistsView()}
            <ReactCSSTransitionGroup component="div"
                                     transitionName="upload"
                                     transitionEnterTimeout={4000}
                                     transitionLeaveTimeout={4000}
            >
              {uploads}
            </ReactCSSTransitionGroup>
          </div>
        </section>
      );
    }

    artistsView() {

      const artists = this.props.library
        .get('artists')
        .toList()
        .map(artist => {
          return (
              <LibraryArtistItem
                  key={artist.get('name')}
                  artist={artist}
                  enabled={this.props.enabled}
                  />
          );
        });

      const empty = (
        <li className="library-item library-empty" key="__empty">
          <em className="name">Library is empty</em>
        </li>
      );

      return (
        <ReactCSSTransitionGroup component="ul"
                                 className="artists tree"
                                 transitionName="slide"
                                 transitionEnter={this.state.animations}
                                 transitionLeave={this.state.animations}
                                 transitionEnterTimeout={4000}
                                 transitionLeaveTimeout={4000}
         >
          {artists.size ? artists : empty}
        </ReactCSSTransitionGroup>
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

        if (!this.state.uploading.length) {
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
