import React, { Component, PropTypes } from 'react';
import cx from 'classnames';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

function formatTime(seconds) {
    function zeroPad(n) {
        return n < 10 ? '0' + n : n;
    }
    return Math.floor(seconds / 60) + ':' + zeroPad(seconds % 60);
}



import styles from '../../sass/playlist-item.scss';

// import { PlaylistMixin } from '../mixins/playlist_mixin.js';

// import { accepts } from '../mixins/playlist_mixin.js';

@withStyles(styles)
@withEnabled
export default class PlaylistItem extends Component {
    // mixins: [/*DragDropMixin, */EnabledMixin],

    static propTypes = {
        //onReorder: PropTypes.func.isRequired,
        //onDidReorder: PropTypes.func.isRequired
    };

    //statics: {
    //    getDragType: function() {
    //        return 'playlist-item';
    //    },
    //
    //    configureDragDrop: function(register) {
    //        register(this.getDragType(), {
    //            dragSource: {
    //                beginDrag: function(component) {
    //                    return {
    //                        item: component.props.item
    //                    };
    //                },
    //                endDrag: function(component) {
    //                    component.props.onDidReorder();
    //                }
    //            },
    //
    //            dropTarget: {
    //                over: function(component, item) {
    //                    component.props.onReorder(item, component.props.item);
    //                }
    //            }
    //        });
    //    }
    //},

    render() {

        //var dragType = this.constructor.getDragType();

        const item = this.props.item;

        let details;

        if (item.get('title')) {
            details = [];

            const artist = item.getIn(['artist', 'name']);
            if (artist) {
                details.push(
                    <span className="artist" key="artist">{artist}</span>
                );

                const album = item.getIn(['album', 'name']);
                if (album) {
                    details.push(<span className="sep" key="sep-album">,&nbsp;</span>);
                    details.push(
                        <span className="album" key="album">{album}</span>
                    );
                }

                const date = item.get('date');
                if (date) {
                    details.push(<span className="sep" key="sep-date">,&nbsp;</span>);
                    details.push(
                        <span className="year" key="year">{date}</span>
                    );
                }
            }

            details = (
              <div className="song">
                <p className="title">{item.get('title')}</p>
                <p className="details">
                  {details}
                </p>
              </div>
            );
        } else {
            details = <span className="url">{item.get('file')}</span>
        }

        const time = formatTime(+this.props.item.get('time'));

        const classes = cx('playlist-item', {
            'playlist-item-selected': this.props.selected,
            'playlist-item-playing': this.props.playing,
            'playlist-item-focus': this.props.focused,
            //'playlist-item-dragging': this.getDragState(dragType).isDragging
        });

        let events;
            //dragSourceAttributes,
            //dropTargetAttributes;

        if (this.props.enabled) {
            events = {
                onMouseDown: this.itemClick.bind(this),
                onDoubleClick: this.itemDblClick.bind(this)
            };

            //dragSourceAttributes = this.dragSourceFor(dragType);
            //dropTargetAttributes = this.dropTargetFor(dragType);
        }

        return (
            <li
                className={classes}
                {...events}
                //{...dragSourceAttributes}
                //{...dropTargetAttributes}
            >
                <div className="image" />
                {details}
                <span className="time">{time}</span>
            </li>
        );
    }

    itemClick(e) {
        if (this.props.onItemClick) {
            this.props.onItemClick(e, this.props.item);
        }
    }

    itemDblClick(e) {
        if (this.props.onItemDblClick) {
            this.props.onItemDblClick(e, this.props.item);
        }

        e.preventDefault();
    }
}
