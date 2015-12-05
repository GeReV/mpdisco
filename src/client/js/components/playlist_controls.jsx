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

  componentWillReceiveProps (nextProps) {
    if (nextProps.status) {
      this.setState({status: nextProps.status});
    }
  }

  render () {
    const shuffleClasses = cx({
      shuffle: true,
      active: + this.state.status.random,
      disabled: !this.props.enabled
    });

    const repeatClasses = cx({
      repeat: true,
      active: + this.state.status.repeat,
      single: + this.state.status.single,
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

    const random = (~this.state.status.random & 1);

    this.props.onShuffle(random);

    e.preventDefault();
  }

  toggleRepeat (e) {
    if (!this.props.enabled) {
      return;
    }

    const repeat = +this.state.status.repeat,
      single = +this.state.status.single;

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
