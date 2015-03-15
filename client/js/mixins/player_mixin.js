var HotKey = require('react-hotkey');

HotKey.activate('keydown');

var isTextInputElement = require('react/lib/isTextInputElement');

var PlayerMixin = {
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
                state: 'stop'
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

            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }

            if (status.state === 'play') {
                this.interval = setInterval(this.timeCounter, 1000);
            }

            this.setState({
                status: status,
                time: time
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

    timeCounter: function() {
        this.setState({
            time: this.state.time + 1
        });
    },

    scrub: function(percent) {
        if (!this.enabled()) {
            return;
        }

        var song = this.state.song;

        var seconds = Math.floor(+song.time * percent);

        this.props.model.seek(song.id, seconds);
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
            var state = this.state.status.state;
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
        var state = this.state.status.state;

        if (state === 'play') {
            this.pause();
        } else if (state === 'pause' || state === 'stop') {
            this.play();
        }
    },

    play: function() {
        this.props.model.play();
    },

    stop: function() {
        this.props.model.stop();
    },

    pause: function() {
        this.props.model.pause(true);
    },

    next: function() {
        this.props.model.next();
    },

    previous: function() {
        this.props.model.previous();
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
};

module.exports = PlayerMixin;