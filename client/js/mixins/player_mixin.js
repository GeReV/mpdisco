var React = require('react/addons');
var HotKey = require('react-hotkey');

HotKey.activate('keydown');

var isTextInputElement = require('react/lib/isTextInputElement');

var MPDiscoController = require('../mpdisco_controller.js');

var tree = require('../mpdisco_model.js').tree;

var PlayerMixin = {
    mixins: [HotKey.Mixin('handleKeyboard'), tree.mixin],

    propTypes: {
        controller: React.PropTypes.instanceOf(MPDiscoController).isRequired
    },

    cursors: {
        song: ['currentsong'],
        status: ['status']
    },

    getInitialState: function() {
        return {
            animations: false,
            time: 0,
            indicatorAppear: false,
            indicatorState: null
        };
    },

    componentDidMount: function() {
        var statusCursor = this.cursors.status;

        statusCursor.on('update', function() {
            var time = 0;
            var status = statusCursor.get();
            if (status.time) {
                time = status.time.split(':');
                time = +time[0];
            }

            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }

            if (status.state === 'play') {
                this.interval = setInterval(this.timeCounter, 1000);
            }

            this.setState({
                time: time
            });
        }.bind(this));
    },

    componentDidUpdate: function() {
        if (this.cursors.song.get() && !this.state.animations) {
            this.setState({
                animations: true
            });
        }
    },

    timeCounter: function() {
        this.setState({
            time: this.state.time + 1
        });
    },

    scrub: function(percent) {
        if (!this.enabled()) {
            return;
        }

        var song = this.cursors.song.get();

        var seconds = Math.floor(+song.time * percent);

        this.props.controller.seek(song.id, seconds);
    },

    handleKeyboard: function(e) {
        if (!this.enabled()) {
            return;
        }

        // Disable hotkeys for text boxes.
        if (isTextInputElement(e.target)) {
            return;
        }

        var key = e.key;

        if (key === 'Unidentified') {
            key = e.keyCode;
        }

        if (key === 90) { // KeyZ
            this.updateIndicator('previous');

            return this.previous();
        }

        if (key === 67 || key === ' ') { // KeyC, Space
            var state = this.cursors.status.get().state;
            var indicator;

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
    },

    togglePlay: function() {
        var state = this.cursors.status.get().state;

        if (state === 'play') {
            this.pause();
        } else if (state === 'pause' || state === 'stop') {
            this.play();
        }
    },

    play: function() {
        this.props.controller.play();
    },

    stop: function() {
        this.props.controller.stop();
    },

    pause: function() {
        this.props.controller.pause(true);
    },

    next: function() {
        this.props.controller.next();
    },

    previous: function() {
        this.props.controller.previous();
    },

    updateIndicator: function(state) {
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
    },

    clearIndicator: function() {
        // Clear the indicator from screen.
        this.indicatorAppearTimeout = null;

        this.setState({
            indicatorAppear: false
        });
    }
};

module.exports = PlayerMixin;