import React, {Component} from 'react';

//var DraggableMixin = require('./../mixins/draggable_mixin.js');
import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/library-item.scss';

@withStyles(styles)
@withEnabled
export default class LibrarySongItem extends Component {

  // mixins: [/*DraggableMixin, */EnabledMixin],

  static getDragType () {
    return 'song';
  }

  getDragItem () {
    return this.props.song;
  }

  render () {

    //var dragSourceAttributes;
    //
    //if (this.enabled()) {
    //    dragSourceAttributes = this.dragSource();
    //}

    const title = this.props.song.get('title');

    return (
      <li className="library-item song">
        <span className="name" title={title}>{title}</span>
      </li>
    );
  }
}
