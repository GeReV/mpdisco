import React, {Component} from 'react';
import { DragSource } from 'react-dnd';
import cx from 'classnames';

import { fetchLibrarySongs } from '../actions';
import { ItemTypes } from '../constants';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library-item.scss';

import LibrarySongItem from './library_song_item.jsx';

const albumSource = {
  beginDrag(props) {
    return {
      album: props.album
    };
  }
};

@withStyles(styles)
@withEnabled
@DragSource(ItemTypes.ALBUM, albumSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class LibraryAlbumItem extends Component {

  state = {
    loaded: false,
    collapsed: true
  };

  static getDragType() {
    return 'album';
  }

  getDragItem() {
    return this.props.album;
  }

  render() {
    const {
      isDragging,
      connectDragSource,
      enabled,
      album
    } = this.props;

    const classes = cx('library-item', 'album', {
      open: !this.state.collapsed
    });

    const treeClasses = cx('tree', 'songs', {
      collapsed: this.state.collapsed
    });

    const songs = album.get('songs')
      .toList()
      .map(song => <LibrarySongItem key={song.get('title')} song={song} enabled={enabled} />);

    const name = album.get('name');

    return connectDragSource(
      <li className={classes}>
        <span className="name"
              title={name}
              onClick={this.toggleSongs}
        >
          <i style={{ backgroundImage: `url(${album.get('cover')})`}} className="cover"/>
          {name}
        </span>
        <ol className={treeClasses}>
          {songs}
        </ol>
      </li>
    );
  }

  toggleSongs = e => {
    const {
      album
    } = this.props;

    if (!album.get('loaded')) {
      fetchLibrarySongs(album.getIn(['artist', 'name']), album.get('name'));

      this.setState({
        collapsed: false
      });
    } else {
      this.setState({
        collapsed: !this.state.collapsed
      });
    }

    e.preventDefault();
  }
}
