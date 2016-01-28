import React, {Component} from 'react';
import cx from 'classnames';

import actions from '../actions';

import withEnabled from '../decorators/withEnabled';

@withEnabled
export default class PlaylistControls extends Component {
  render () {
    const shuffleClasses = cx({
      shuffle: true,
      active: + this.props.status.get('random'),
      disabled: !this.props.enabled
    });

    const repeatClasses = cx({
      repeat: true,
      active: + this.props.status.get('repeat'),
      single: + this.props.status.get('single'),
      disabled: !this.props.enabled
    });

    const removeClasses = cx({
      remove: true,
      disabled: !this.props.enabled // || (this.state.selectedItems.length <= 0)
    });

    return (
      <div className="playlist-controls">
        <a className={shuffleClasses} href="#" onClick={this.toggleShuffle.bind(this)}>
          <i className="icon-random" />
        </a>
        <a className={repeatClasses} href="#" onClick={this.toggleRepeat.bind(this)}>
          <i className="icon-refresh" />
        </a>
        <span className="separator" />
        <a className={removeClasses} href="#" onClick={this.remove.bind(this)}>
          <i className="icon-trash" />
        </a>
      </div>
    );
  }

  toggleShuffle (e) {
    if (!this.props.enabled) {
      return;
    }

    const shuffle = (~this.props.status.get('random') & 1);

    actions.toggleShuffle(shuffle);

    e.preventDefault();
  }

  toggleRepeat (e) {
    if (!this.props.enabled) {
      return;
    }

    const repeat = +this.props.status.get('repeat'),
          single = +this.props.status.get('single');

    // Note single cannot be on without repeat.

    if (repeat && single) {
      // Both on, turn both off.
      actions.toggleRepeat(0, 0);
    } else if (repeat) {
      // Repeat on, turn single on.
      actions.toggleRepeat(1, 1);
    } else {
      // Both off, turn repeat on.
      actions.toggleRepeat(1, 0);
    }

    e.preventDefault();
  }

  remove (e) {
    if (!this.props.enabled) {
      return;
    }

    //actions.playlistRemoveItems(items || this.state.selectedItems);

    e.preventDefault();
  }
}
