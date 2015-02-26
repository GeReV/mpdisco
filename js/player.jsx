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

        this.props.model.on('state', function(state) {
            var time = 0;
            if (state.time) {
                time = state.time.split(':');
                time = +time[0];
            }

            console.log(state);

            var interval = this.state.interval;
            if (interval) {
                clearInterval(interval);
            }

            if (state.state === 'play') {
                interval = setInterval(this.timeCounter, 1000);
            }

            this.setState({
                state: state,
                time: time,
                interval: interval
            });
        }.bind(this));

        this.props.model.fetchSong();
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
                <Scrubber progress={this.state.time} total={song.time} />
            </div>
        );
    },

    timeCounter: function() {
        this.setState({
            time: this.state.time + 1
        });
    }
});

module.exports = Player;