import React, { Component } from 'react';

import cx from 'classnames';

import actions from '../actions';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library-item.scss';

//var DraggableMixin = require('./../mixins/draggable_mixin.js');
// import EnabledMixin from '../mixins/enabled_mixin.js';

import LibraryAlbumItem from './library_album_item.jsx';

@withStyles(styles)
@withEnabled
export default class LibraryArtistItem extends Component {

    // mixins: [/*DraggableMixin, */EnabledMixin],

    static getDragType() {
      return 'artist';
    }

    constructor() {
      super();

      this.state = {
          loaded: false,
          collapsed: true
      };
    }

    getDragItem() {
        return this.props.artist;
    }

    render() {
        const classes = cx({
            'library-item': true,
            'artist': true,
            'open': !this.state.collapsed
        });

        const treeClasses = cx({
            albums: true,
            tree: true,
            collapsed: this.state.collapsed
        });

        const enabled = this.props.enabled;

        const artist = this.props.artist;

        const albums = artist.get('albums')
          .toList()
          .map(album => {
            return (
              <LibraryAlbumItem key={album.get('name')}
                                album={album}
                                enabled={enabled} />
            );
          });

        //var dragSourceAttributes;
        //
        //if (enabled) {
        //    dragSourceAttributes = this.dragSource();
        //}

        const name = artist.get('name');

        return (
            <li className={classes}/* {...dragSourceAttributes}*/>
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
