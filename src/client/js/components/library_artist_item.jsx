import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import cx from 'classnames';

import actions from '../actions';
import { ItemTypes } from '../constants';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library-item.scss';

import LibraryAlbumItem from './library_album_item.jsx';

const artistSource = {
  beginDrag(props) {
    return {
      artist: props.artist
    };
  }
};

@withStyles(styles)
@withEnabled
@DragSource(ItemTypes.ARTIST, artistSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class LibraryArtistItem extends Component {

    constructor() {
      super();

      this.state = {
          loaded: false,
          collapsed: true
      };
    }

    render() {
        const {
          isDragging,
          connectDragSource,
          enabled,
          artist
        } = this.props;

        const classes = cx('library-item', 'artist', {
            'open': !this.state.collapsed
        });

        const treeClasses = cx('tree', 'albums', {
          collapsed: this.state.collapsed
        });

        const albums = artist.get('albums')
          .toList()
          .map(album => {
            return (
              <LibraryAlbumItem key={album.get('name')}
                                album={album}
                                enabled={enabled} />
            );
          });

        const name = artist.get('name');

        return connectDragSource(
            <li className={classes}>
                <span className="name"
                      title={name}
                      onClick={this.toggleAlbums.bind(this)}>
                  {name}
                </span>
                <ul className={treeClasses}>
                  {albums}
                </ul>
            </li>
        );
    }

    toggleAlbums(e) {
        if (!this.state.loaded) {

            actions.fetchLibraryAlbums(this.props.artist.get('name'));

            this.setState({
                loaded: true,
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
