// import React from 'react';

// import MPDiscoController from '../mpdisco_controller.js';

// import { tree } from '../mpdisco_model.js';

export default {
    propTypes: {
        // controller: React.PropTypes.instanceOf(MPDiscoController).isRequired
    },

    // mixins: [tree.mixin],

    cursors: {
        listeners: ['listeners'],
        me: ['me']
    },

    handleIdentify: function(name) {
        this.props.controller.listenerIdentify(name);
    }
};
