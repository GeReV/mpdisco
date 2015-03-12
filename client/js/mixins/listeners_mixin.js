var React = require('react/addons');

var ListenersModel = require('../models/listeners_model.js');

var ListenersMixin = {
    propTypes: {
        model: React.PropTypes.instanceOf(ListenersModel).isRequired
    },

    getInitialState: function() {
        return {
            listeners: this.props.model.listeners || []
        }
    },

    componentDidMount: function() {
        var updateList = function(listeners, me) {
            this.setState({
                listeners: listeners,
                me: me
            });
        }.bind(this);

        this.props.model.on('clientslist', updateList);

        this.props.model.fetchListeners();
    },

    handleIdentify: function(name) {
        this.props.model.identify(name);
    }
};

module.exports = ListenersMixin;