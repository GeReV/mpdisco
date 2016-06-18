import React, { Component, PropTypes } from 'react';
import cx from 'classnames';

import {
  toggleRepeat,
  toggleShuffle,
  playlistRemoveSelectedItems
} from '../actions';

import withEnabled from '../decorators/withEnabled';

@withEnabled
export default class PlaylistControls extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    status: PropTypes.func
  };

  render() {
    const shuffleClasses = cx({
      shuffle: true,
      active: +this.props.status.get('random'),
      disabled: !this.props.enabled
    });

    const repeatClasses = cx({
      repeat: true,
      active: +this.props.status.get('repeat'),
      single: +this.props.status.get('single'),
      disabled: !this.props.enabled
    });

    const removeClasses = cx({
      remove: true,
      disabled: !this.props.enabled // || (this.state.selectedItems.length <= 0)
    });

    return (
      <div className="playlist-controls">
        <a className={shuffleClasses} href="#" onClick={this.toggleShuffle}>
          <i className="icon-random" />
        </a>
        <a className={repeatClasses} href="#" onClick={this.toggleRepeat}>
          <i className="icon-refresh" />
        </a>
        <span className="separator" />
        <a className={removeClasses} href="#" onClick={this.remove}>
          <i className="icon-trash" />
        </a>
      </div>
    );
  }

  toggleShuffle = e => {
    if (!this.props.enabled) {
      return;
    }

    const shuffle = (~this.props.status.get('random') & 1);

    toggleShuffle(shuffle);

    e.preventDefault();
  }

  toggleRepeat = e => {
    if (!this.props.enabled) {
      return;
    }

    const repeat = +this.props.status.get('repeat');
    const single = +this.props.status.get('single');

    // Note single cannot be on without repeat.

    if (repeat && single) {
      // Both on, turn both off.
      toggleRepeat(0, 0);
    } else if (repeat) {
      // Repeat on, turn single on.
      toggleRepeat(1, 1);
    } else {
      // Both off, turn repeat on.
      toggleRepeat(1, 0);
    }

    e.preventDefault();
  }

  remove = e => {
    if (!this.props.enabled) {
      return;
    }

    playlistRemoveSelectedItems();

    e.preventDefault();
  }
}
