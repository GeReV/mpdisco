import React, {Component} from 'react';

import cx from 'classnames';

import actions from '../actions';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library-item.scss';
//var DraggableMixin = require('./../mixins/draggable_mixin.js');
// import EnabledMixin from '../mixins/enabled_mixin.js';

import LibrarySongItem from './library_song_item.jsx';

@withStyles(styles)
@withEnabled
export default class LibraryAlbumItem extends Component {

  static getDragType () {
    return 'album';
  }

  constructor () {
    super();

    this.state = {
      loaded: false,
      collapsed: true
    };
  }

  getDragItem () {
    return this.props.album;
  }

  render () {
    const classes = cx({
      'library-item': true,
      'album': true,
      'open': !this.state.collapsed
    });

    const treeClasses = cx({'songs': true, 'tree': true, 'collapsed': this.state.collapsed});

    const enabled = this.props.enabled;

    const album = this.props.album;

    const songs = album.get('songs').toList().map(song => <LibrarySongItem key={song.get('title')} song={song} enabled={enabled}/>);

    //var dragSourceAttributes;
    //
    //if (enabled) {
    //    dragSourceAttributes = this.dragSource();
    //}

    const name = album.get('name');

    return (
      <li className={classes} /* {...dragSourceAttributes}*/
> < span className = "name" title = {
      name
    }
    onClick = {
      this.toggleSongs.bind(this)
    } > <img src={album.get('cover')} alt="Cover" className="cover"/>
      {name} < /span>
                <ol className={treeClasses}>
                  {songs}
                </ol > </li>);
  }

  toggleSongs (e) {
    if (!this.state.loaded) {

      const album = this.props.album;

      actions.fetchLibrarySongs(album.getIn(['artist', 'name']), album.get('name'));

      this.setState({loaded: true, collapsed: false});
    } else {
      this.setState({
        collapsed: !this.state.collapsed
      });
    }

    e.preventDefault();
  }
}
