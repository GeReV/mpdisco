import React from 'react';
import _ from 'lodash';

import update from 'react-addons-update';

export default {
    reorder: function(item1, item2) {
        var index1 = this.state.items.indexOf(item1);
        var index2 = this.state.items.indexOf(item2);

        var stateUpdate = {
            items: {
                $splice: [
                    [index1, 1],
                    [index2, 0, item1]
                ]
            }
        };

        this.setState(update(this.state, stateUpdate));
    }
};
