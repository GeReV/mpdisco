import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import cx from 'classnames';

import PlayerControls from './player_controls.jsx';
import Scrubber from './scrubber.jsx';

import PlayerMixin from '../mixins/player_mixin.js';
import EnabledMixin from '../mixins/enabled_mixin.js';

function formatTime(seconds) {
    function zeroPad(n) {
        return n < 10 ? '0' + n : n;
    }
    return zeroPad(Math.floor(seconds / 60)) + ':' + zeroPad(seconds % 60);
}

export default React.createClass({
    mixins: [PlayerMixin, EnabledMixin],

    render: function() {
        var classes = cx({
            'player-disabled': !this.enabled()
        });

        var song = this.cursors.song.get();

        var time = formatTime(this.state.time || 0);

        var title = song.title || 'Idle';

        var album = song.album ? ('- ' + song.album) : '';

        var indicatorClasses = cx({
            'indicator': true,
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
                    >
                        <span key={'title_' + song.id}>{title}</span>
                    </ReactCSSTransitionGroup>
                    <ReactCSSTransitionGroup
                        component="h2"
                        transitionName="slide"
                        transitionEnter={this.state.animations}
                        transitionLeave={this.state.animations}
                    >
                        <span key={'artist_album_' + song.id}>{song.artist} {album}</span>
                    </ReactCSSTransitionGroup>

                    <h2 className="duration">{time}</h2>

                    <PlayerControls
                        state={this.cursors.status.get().state}
                        onPlay={this.togglePlay}
                        onStop={this.stop}
                        onNext={this.next}
                        onPrevious={this.previous}
                    />
                </div>
                <Scrubber progress={this.state.time} total={song.time} onScrub={this.scrub} />
                <div className={indicatorClasses} />
            </section>
        );
    }
});
