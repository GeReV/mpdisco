import React, { Component } from 'react';

export default {
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
