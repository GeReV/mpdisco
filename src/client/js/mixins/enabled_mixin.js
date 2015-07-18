var React = require('react/addons');

var EnabledMixin = {
    propTypes: {
        enabled: React.PropTypes.bool
    },
    enabled: function() {
        if (this.props.enabled === undefined) {
            return true;
        }
        return this.props.enabled;
    }
};

module.exports = EnabledMixin;