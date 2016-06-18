import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import withStyles from '../decorators/withStyles';

import styles from '../../sass/scrubber.scss';

import { seek } from '../actions';

@withStyles(styles)
class Scrubber extends Component {
  static propTypes = {
    song: PropTypes.object,
    total: PropTypes.number,
    progress: PropTypes.number,
    enabled: PropTypes.bool
  };

  render() {
    let progress = 0;

    if (this.props.progress && this.props.total) {
      progress = this.props.progress / this.props.total * 100;

      if (progress > 100) {
        progress = 100;
      }
    }

    const style = {
      width: progress + '%'
    };

    return (
      <div id="scrubber" onClick={this.scrub.bind(this)}>
        <div className="progress" style={style}/>
      </div>
    );
  }

  scrub = e => {
    const percent = (e.nativeEvent.offsetX / ReactDOM.findDOMNode(this).offsetWidth);

    if (!this.props.enabled) {
      return;
    }

    const song = this.props.song;

    const seconds = Math.floor(+song.get('time') * percent);

    seek(song.get('id'), seconds);
  };
}

export default Scrubber;
