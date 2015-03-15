var React = require('react/addons');

var MPDiscoController = require('../mpdisco_controller.js');

var tree = require('../mpdisco_model.js').tree;

var ListenersMixin = {
    propTypes: {
        controller: React.PropTypes.instanceOf(MPDiscoController).isRequired
    },

    mixins: [tree.mixin],

    cursors: {
        listeners: ['listeners'],
        me: ['me']
    },

    handleIdentify: function(name) {
        this.props.controller.listenerIdentify(name);
    }
};

module.exports = ListenersMixin;