import React, { Component } from 'react';
import cx from 'classnames';
import { DropTarget } from 'react-dnd';

import {
  play,
  fetchPlaylist,
  playlistAddItem,
  playlistRemoveItems,
  playlistReorderItems
} from '../actions';

import { ItemTypes } from '../constants';

import PlaylistControls from './playlist_controls.jsx';
import PlaylistItem from './playlist_item.jsx';
import ListView from './list_view.jsx';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/playlist.scss';

const playlistTarget = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      // If you want, you can check whether some nested
      // target already handled drop
      return null;
    }

    playlistAddItem(monitor.getItemType(), monitor.getItem());

    // You can also do nothing and return a drop result,
    // which will be available as monitor.getDropResult()
    // in the drag source's endDrag() method
    return {
      moved: true
    };
  }
};

@withStyles(styles)
@withEnabled
@DropTarget([ItemTypes.ARTIST, ItemTypes.ALBUM, ItemTypes.SONG], playlistTarget, (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDropTarget: connect.dropTarget(),
  // You can ask the monitor about the current drag state:
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
export default class Playlist extends Component {
  state = {
    animations: false,
    selectedItems: []
  };

  componentDidMount() {
    fetchPlaylist();

    // Turn library update animations on.
    this.setState({
      animations: true
    });
  }

  render() {
    const {
      playlist,
      isOver,
      canDrop,
      connectDropTarget,
      enabled,
      status
    } = this.props;

    const playlistClasses = cx({
      'playlist-drop': isOver,
      'playlist-disabled': !enabled
    });

    return connectDropTarget(
      <section id="playlist" className={playlistClasses}>
        <header>
          <span>Playlist</span>
          <PlaylistControls status={status}
                            enabled={enabled}
          />
        </header>
        <ListView
            className="content list"
            enabled={enabled}
            items={playlist}
            itemCreator={this.itemCreator}
            enabled={enabled}
            onItemActivated={this.itemPlayed}
            onItemRemoved={this.itemRemoved}
            onItemsSelected={this.itemsSelected}
            onItemsReordered={this.itemsReordered} />
        <div className="lock">
          <i className="icon-lock" />
          <span>You are not the current DJ</span>
        </div>
      </section>
    );
  }

  itemCreator = item => {
    const song = this.props.song;
    const isPlaying = (song && song.get('id') === item.get('id'));

    return (
      <PlaylistItem
        key={item.get('id')}
        item={item}
        enabled={this.props.enabled}
        playing={isPlaying}
      />
    );
  };

  itemPlayed(item) {
    play(item.get('id'));
  }

  itemRemoved = items => {
    playlistRemoveItems(items || this.state.selectedItems);
  };

  itemsSelected = items => {
    this.setState({
      selectedItems: items
    });
  };

  itemsReordered = items => {
    this.setState({
      items: items
    });
    playlistReorderItems(items);
  };
}
