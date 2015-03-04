var React = require('react/addons');

var cx = React.addons.classSet;

var Scrubber = require('./scrubber.jsx');

function formatTime(seconds) {
    function zeroPad(n) {
        return n < 10 ? '0' + n : n;
    }
    return zeroPad(Math.floor(seconds / 60)) + ':' + zeroPad(seconds % 60);
}

var Player = React.createClass({
    getInitialState: function() {
        return {
            song: {
                title: '',
                artist: '',
                album: '',
                time: 0
            },
            time: 0,
            indicatorAppear: false,
            indicatorState: null
        };
    },

    componentWillMount: function() {
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

        this.props.model.fetchSong();

        document.addEventListener('keydown', this.handleKeyboard, false);
    },

    componentWillUnmount: function() {
        document.removeEventListener('keydown', this.handleKeyboard, false);
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
                    <h1>{title}</h1>
                    <h2>{song.artist} {album}</h2>
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
        var shift = e.shiftKey;
        var key = e.keyCode || e.which;

        if (key === 0x20) {
            return this.togglePlay();
        }

        if (shift) {
            if (key === 0x5a) { // KeyZ
                return this.previous();
            }

            if (key === 0x43) { // KeyC
                return this.togglePlay();
            }

            if (key === 0x56) { // KeyV
                return this.stop();
            }

            if (key === 0x58) { // KeyX
                return this.play();
            }

            if (key === 0x42) { // KeyB
                return this.next();
            }
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