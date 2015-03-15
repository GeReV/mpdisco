var React = require('react/addons');

var ListenersMixin = require('./mixins/listeners_mixin.js');

var MasterModeModel = require('./models/master_mode_model.js');

var MasterModeListener = require('./master_mode_listener.jsx');

var MasterModeListeners = React.createClass({
    mixins: [ListenersMixin],

    propTypes: {
        mastermode: React.PropTypes.instanceOf(MasterModeModel).isRequired
    },

    componentDidMount: function() {
        this.props.mastermode.on('master', this.setMaster);
    },

    render: function() {
        var me = this.cursors.me.get();
        var listeners = this.cursors.listeners.get().map(function(listener) {
            var isMe = (listener.userid === me.userid);
            var isMaster = this.state.master === listener.userid;
            var isNextMaster = false;

            return (
                <MasterModeListener
                    key={listener.userid}
                    listener={listener}
                    you={isMe}
                    master={isMaster}
                    next={isNextMaster}
                    onIdentify={this.handleIdentify}
                    />
            );
        }, this);

        return (
            <section id="listeners">
                <header>Listeners</header>
                <ul className="content">
                    {listeners}
                </ul>
            </section>
        );
    },

    setMaster: function(master) {
        this.setState({
            master: master
        });
    }
});

module.exports = MasterModeListeners;
