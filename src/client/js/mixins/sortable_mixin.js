var React = require('react/addons');

var _ = require('lodash');

var update = React.addons.update;

var SortableMixin = {
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

module.exports = SortableMixin;
