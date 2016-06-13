import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import cx from 'classnames';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import { ItemTypes } from '../constants';

import styles from '../../sass/playlist-item.scss';

function formatTime(seconds) {
  function zeroPad(n) {
    return ('0' + n).slice(-2);
  }
  return Math.floor(seconds / 60) + ':' + zeroPad(seconds % 60);
}

const itemSource = {
  beginDrag(props) {
    return {
      index: props.index
    };
  }
};

const itemTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.onReorder(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};


@withStyles(styles)
@withEnabled
@DropTarget(ItemTypes.PLAYLIST_ITEM, itemTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(ItemTypes.PLAYLIST_ITEM, itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class PlaylistItem extends Component {
  static propTypes = {
    onReorder: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired
  };

  render() {

    const {
      item,
      enabled,
      isDragging,
      connectDragSource,
      connectDropTarget,
      selected,
      playing,
      focused
    } = this.props;

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

    const time = formatTime(+item.get('time'));

    const classes = cx('playlist-item', {
      'playlist-item-selected': selected,
      'playlist-item-playing': playing,
      'playlist-item-focus': focused,
      'playlist-item-dragging': isDragging
    });

    let events;

    if (enabled) {
      events = {
        onMouseDown: this.itemClick,
        onDoubleClick: this.itemDblClick
      };
    }

    const result = (
      <li className={classes}
        {...events}
      >
        <div className="image"/>
        {details}
        <span className="time">{time}</span>
      </li>
    );

    if (enabled) {
      return connectDragSource(connectDropTarget(result));
    }

    return result;
  }

  itemClick = e => {
    if (this.props.onItemClick) {
      this.props.onItemClick(e, this.props.item);
    }
  };

  itemDblClick = e => {
    if (this.props.onItemDblClick) {
      this.props.onItemDblClick(e, this.props.item);
    }

    e.preventDefault();
  };
}
