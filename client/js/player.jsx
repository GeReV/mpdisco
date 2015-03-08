var React = require('react/addons');
var HotKey = require('react-hotkey');

var cx = React.addons.classSet;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Scrubber = require('./scrubber.jsx');

HotKey.activate('keydown');

function formatTime(seconds) {
    function zeroPad(n) {
        return n < 10 ? '0' + n : n;
    }
    return zeroPad(Math.floor(seconds / 60)) + ':' + zeroPad(seconds % 60);
}

var Player = React.createClass({
    mixins: [HotKey.Mixin('handleKeyboard')],

    getInitialState: function() {
        return {
            animations: false,
            song: {
                title: '',
                artist: '',
                album: '',
                time: 0
            },
            status: {
                state: ''
            },
            time: 0,
            indicatorAppear: false,
            indicatorState: null
        };
    },

    componentDidMount: function() {
        this.props.model.on('song', function(song) {
            this.setState({
                song: song
            });
        }.bind(this));

        this.props.model.on('state', function(status) {
            var time = 0;
            if (status.time) {
                time = status.time.split(':');
                time = +time[0];
            }

            var interval = this.state.interval;
            if (interval) {
                clearInterval(interval);
            }

            if (status.state === 'play') {
                interval = setInterval(this.timeCounter, 1000);
            }

            this.setState({
                status: status,
                time: time,
                interval: interval
            });
        }.bind(this));

        this.props.model.update();
    },

    componentDidUpdate: function() {
        if (this.state.song && !this.state.animations) {
            this.setState({
                animations: true
            });
        }
    },

    render: function() {
        var song = this.state.song;

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
            <div id="player">
                <div className="info">
                    <ReactCSSTransitionGroup component="h1" transitionName="slide" transitionEnter={this.state.animations} transitionLeave={this.state.animations}>
                        <span key={'title_' + song.id}>{title}</span>
                    </ReactCSSTransitionGroup>
                    <ReactCSSTransitionGroup component="h2" transitionName="slide" transitionEnter={this.state.animations} transitionLeave={this.state.animations}>
                        <span key={'artist_album_' + song.id}>{song.artist} {album}</span>
                    </ReactCSSTransitionGroup>
                    <h2 className="duration">{time}</h2>
                </div>
                <Scrubber progress={this.state.time} total={song.time} onScrub={this.scrub} />
                <div className={indicatorClasses} />
            </div>
        );
    },

    timeCounter: function() {
        this.setState({
            time: this.state.time + 1
        });
    },

    scrub: function(percent) {
        var song = this.state.song;

        var seconds = Math.floor(+song.time * percent);

        this.props.model.seek(song.id, seconds);
    },

    handleKeyboard: function(e) {
        var key = e.key;

        if (key === 'Unidentified') {
            key = e.keyCode;
        }

        if (key === ' ') {
            return this.togglePlay();
        }

        if (key === 90) { // KeyZ
            return this.previous();
        }

        if (key === 67) { // KeyC
            return this.togglePlay();
        }

        if (key === 86) { // KeyV
            return this.stop();
        }

        if (key === 88) { // KeyX
            return this.play();
        }

        if (key === 66) { // KeyB
            return this.next();
        }
    },

    togglePlay: function() {
        var state = this.state.status.state;

        if (state === 'play') {
            this.pause();
        } else if (state === 'pause' || state === 'stop') {
            this.play();
        }
    },
    play: function() {
        this.props.model.play();

        this.updateIndicator('play');
    },
    stop: function() {
        this.props.model.stop();

        this.updateIndicator('stop');
    },
    pause: function() {
        this.props.model.pause(true);

        this.updateIndicator('pause');
    },
    next: function() {
        this.props.model.next();

        this.updateIndicator('next');
    },
    previous: function() {
        this.props.model.previous();

        this.updateIndicator('previous');
    },
    updateIndicator: function(state) {
        // Clear any pending timeout, so it trigger and hide our indicator prematurely.
        if (this.state.indicatorAppearTimeout) {
            clearTimeout(this.state.indicatorAppearTimeout);
        }

        // Once the clear is finished, show the updated indicator.
        this.setState({
            indicatorState: state,
            indicatorAppear: true,
            indicatorAppearTimeout: setTimeout(this.clearIndicator, 400)
        });
    },

    clearIndicator: function() {
        // Clear the indicator from screen.
        this.setState({
            indicatorAppear: false,
            indicatorAppearTimeout: null
        });
    }
});

module.exports = Player;