import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import cx from 'classnames';
import { nuclearComponent } from 'nuclear-js-react-addons';

import isTextInputElement from 'react/lib/isTextInputElement';

import actions from '../actions';
import getters from '../getters';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/player.scss';

import Scrubber from './scrubber.jsx';
import PlayerControls from './player_controls.jsx';

function formatTime(seconds) {
    function zeroPad(n) {
        return n < 10 ? '0' + n : n;
    }
    return zeroPad(Math.floor(seconds / 60)) + ':' + zeroPad(seconds % 60);
}

@nuclearComponent(props => {
  return {
    status: getters.currentStatus
  };
})
@withStyles(styles)
@withEnabled
export default class Player extends Component {
  constructor() {
    super();

    this.state = {
      time: 0,
      animations: false,
      indicatorAppear: false,
      indicatorState: null
    };
  }

  componentDidUpdate(prevProps) {
    const status = this.props.status;

    if (prevProps.status !== status) {

      let time = 0;
      if (status.get('time')) {
        time = status.get('time').split(':');
        time = +time[0];
      }

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }

      if (status.get('state') === 'play') {
        this.interval = setInterval(this.timeCounter.bind(this), 1000);
      }

      this.setState({
        time: time
      });
    }

    if (this.props.song && !this.state.animations) {
      this.setState({
        animations: true
      });
    }
  }

  render() {
    const classes = cx({
      'player-disabled': !this.props.enabled
    });

    const { song, status } = this.props;

    const time = formatTime(this.state.time || 0);

    const title = song.get('title') || 'Idle';

    const album = song.get('album') ? `-  ${song.get('album')}` : '';

    const indicatorClasses = cx('indicator', {
      'appear': this.state.indicatorAppear,
      'icon-play': (this.state.indicatorState === 'play'),
      'icon-pause': (this.state.indicatorState === 'pause'),
      'icon-stop': (this.state.indicatorState === 'stop'),
      'icon-step-forward': (this.state.indicatorState === 'next'),
      'icon-step-backward': (this.state.indicatorState === 'previous')
    });

    return (
      <section id="player" className={classes}>
        <div className="info">
          <ReactCSSTransitionGroup
            component="h1"
            transitionName="slide"
            transitionEnter={this.state.animations}
            transitionLeave={this.state.animations}
            transitionEnterTimeout={4000}
            transitionLeaveTimeout={4000}
          >
            <span key={'title_' + song.get('id')}>{title}</span>
          </ReactCSSTransitionGroup>
          <ReactCSSTransitionGroup
            component="h2"
            transitionName="slide"
            transitionEnter={this.state.animations}
            transitionLeave={this.state.animations}
            transitionEnterTimeout={4000}
            transitionLeaveTimeout={4000}
          >
            <span key={'artist_album_' + song.get('id')}>{song.get('artist')} {album}</span>
          </ReactCSSTransitionGroup>

          <h2 className="duration">{time}</h2>

          <PlayerControls
              state={status.get('state')}
              onPlay={this.togglePlay.bind(this)}
              onStop={this.stop.bind(this)}
              onNext={this.next.bind(this)}
              onPrevious={this.previous.bind(this)}
          />
        </div>
        <Scrubber progress={this.state.time} total={song.get('time')} onScrub={this.scrub.bind(this)} />
        <div className={indicatorClasses} />
      </section>
    );
  }

  timeCounter() {
    this.setState({
      time: this.state.time + 1
    });
  }

  scrub(percent) {
    if (!this.props.enabled) {
      return;
    }

    const song = this.props.song;

    const seconds = Math.floor(+song.get('time') * percent);

    this.props.controller.seek(song.get('id'), seconds);
  }

  handleKeyboard(e) {
    if (!this.props.enabled) {
      return;
    }

    // Disable hotkeys for text boxes.
    if (isTextInputElement(e.target)) {
      return;
    }

    let key = e.key;

    if (key === 'Unidentified') {
      key = e.keyCode;
    }

    if (key === 90) { // KeyZ
      this.updateIndicator('previous');

      return this.previous();
    }

    if (key === 67 || key === ' ') { // KeyC, Space
      const state = this.props.status.get('state');
      let indicator;

      if (state === 'play') {
        indicator = 'pause';
      } else if (state === 'pause' || state === 'stop') {
        indicator = 'play';
      }

      this.updateIndicator(indicator);

      return this.togglePlay();
    }

    if (key === 86) { // KeyV
      this.updateIndicator('stop');

      return this.stop();
    }

    if (key === 88) { // KeyX
      this.updateIndicator('play');

      return this.play();
    }

    if (key === 66) { // KeyB
      this.updateIndicator('next');

      return this.next();
    }
  }

  togglePlay() {
    const state = this.props.status.get('state');

    if (state === 'play') {
      this.pause();
    } else if (state === 'pause' || state === 'stop') {
      this.play();
    }
  }

  play() {
    actions.play();
  }

  stop() {
    actions.stop();
  }

  pause() {
    actions.pause(true);
  }

  next() {
    actions.next();
  }

  previous() {
    actions.previous();
  }

  updateIndicator(state) {
    // Clear any pending timeout, so it trigger and hide our indicator prematurely.
    if (this.indicatorAppearTimeout) {
      clearTimeout(this.indicatorAppearTimeout);
    }

    this.indicatorAppearTimeout = setTimeout(this.clearIndicator, 400);

    // Once the clear is finished, show the updated indicator.
    this.setState({
      indicatorState: state,
      indicatorAppear: true
    });
  }

  clearIndicator() {
    // Clear the indicator from screen.
    this.indicatorAppearTimeout = null;

    this.setState({
      indicatorAppear: false
    });
  }
}
