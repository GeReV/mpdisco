var React = require('react/addons');

var cx = React.addons.classSet;

var PlayerControls = React.createClass({
    propTypes: {
        onPrevious: React.PropTypes.func.isRequired,
        onStop: React.PropTypes.func.isRequired,
        onPlay: React.PropTypes.func.isRequired,
        onNext: React.PropTypes.func.isRequired,
        state: React.PropTypes.string.isRequired
    },

    render: function() {
        var playClasses = cx({
            'icon-2x': true,
            'icon-pause': (this.props.state === 'play'),
            'icon-play': (this.props.state !== 'play')
        });

        return (
            <div className="player-controls">
                <a href="#" className="icon-2x icon-step-backward" onClick={this.nullifyEvent(this.props.onPrevious)} />
                <a href="#" className={playClasses} onClick={this.nullifyEvent(this.props.onPlay)} />
                <a href="#" className="icon-2x icon-stop" onClick={this.nullifyEvent(this.props.onStop)} />
                <a href="#" className="icon-2x icon-step-forward" onClick={this.nullifyEvent(this.props.onNext)} />
            </div>
        );
    },

    nullifyEvent: function(callback) {
        return function(e) {
            e.preventDefault();

            callback();
        };
    }
});

module.exports = PlayerControls;