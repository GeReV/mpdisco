var React = require('./vendor/react/react-with-addons.js');

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
            time: 0
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

        return (
            <div id="player">
                <div className="info">
                    <h1>{title}</h1>
                    <h2>{song.artist} {album}</h2>
                    <h2 className="duration">{time}</h2>
                </div>
                <Scrubber progress={this.state.time} total={song.time} onScrub={this.scrub} />
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
                return this.props.model.previous();
            }

            if (key === 0x43) { // KeyC
                return this.togglePlay();
            }

            if (key === 0x56) { // KeyV
                return this.props.model.stop();
            }

            if (key === 0x58) { // KeyX
                return this.props.model.play();
            }

            if (key === 0x42) { // KeyB
                return this.props.model.next();
            }
        }
    },

    togglePlay: function() {
        var model = this.props.model;
        var state = this.state.status.state;

        if (state === 'play') {
            model.pause(true);
        } else if (state === 'pause' || state === 'stop') {
            model.play();
        }
    }
});

module.exports = Player;