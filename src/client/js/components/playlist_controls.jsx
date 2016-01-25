import React, {Component} from 'react';
import cx from 'classnames';

import withEnabled from '../decorators/withEnabled';

@withEnabled
export default class PlaylistControls extends Component {
  static propTypes = {
    onShuffle: React.PropTypes.func.isRequired,
    onRepeat: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  };

  constructor () {
    super();

    this.state = {
      status: {
        random: 0,
        repeat: 0,
        single: 0
      }
    };
  }

  render () {
    const shuffleClasses = cx({
      shuffle: true,
      active: + this.props.status.random,
      disabled: !this.props.enabled
    });

    const repeatClasses = cx({
      repeat: true,
      active: + this.props.status.repeat,
      single: + this.props.status.single,
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

    const random = (~this.props.status.random & 1);

    this.props.onShuffle(random);

    e.preventDefault();
  }

  toggleRepeat (e) {
    if (!this.props.enabled) {
      return;
    }

    const repeat = +this.props.status.repeat,
          single = +this.props.status.single;

    // Note single cannot be on without repeat.

    this.props.onRepeat(repeat, single);

    e.preventDefault();
  }

  remove (e) {
    if (!this.props.enabled) {
      return;
    }

    this.props.onRemove();

    e.preventDefault();
  }
}
