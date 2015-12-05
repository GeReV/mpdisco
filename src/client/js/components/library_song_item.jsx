import React, {Component} from 'react';
import { DragSource } from 'react-dnd';

import { ItemTypes } from '../constants';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library-item.scss';

const songSource = {
  beginDrag(props) {
    return {
      song: props.song
    };
  }
};

@withStyles(styles)
@withEnabled
@DragSource(ItemTypes.SONG, songSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class LibrarySongItem extends Component {
  render() {
    const {
      isDragging,
      connectDragSource,
      enabled,
      song
    } = this.props;

    const title = song.get('title');

    return connectDragSource(
      <li className="library-item song">
        <span className="name" title={title}>{title}</span>
      </li>
    );
  }
}
