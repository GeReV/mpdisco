var React = require('./vendor/react/react-with-addons.js');

var Scrubber = require('./scrubber.jsx');

var Player = React.createClass({
    getInitialState: function() {
        return {
            song: {
                title: '',
                artist: '',
                album: ''
            },
            time: 0
        };
    },

    componentWillMount: function() {
        this.props.model.on('song', function(song) {
            console.log('song', song);

            this.setState({
                song: song
            });
        }.bind(this));

        this.props.model.on('state', function(state) {
            console.log('state', state);

            this.setState({
                state: state
            });
        }.bind(this));

        this.props.model.fetchSong();
    },

    render: function() {
        var song = this.state.song;

        var time = this.state.time || '00:00';

        var title = song.title || 'Idle';

        var album = song.album ? ('- ' + song.album) : '';

        return (
            <div id="player">
                <div className="info">
                    <h1>{title}</h1>
                    <h2>{song.artist} {album}</h2>
                    <h2 className="duration">{time}</h2>
                </div>
                <Scrubber model={this.props.model} />
            </div>
        );
    }
});

module.exports = Player;