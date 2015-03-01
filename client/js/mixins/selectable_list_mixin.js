var _ = require('underscore');

var SelectableListMixin = {
    itemSelected: function(e, item) {
        var selected = this.state.selected;

        if (e.ctrlKey || e.metaKey) {
            selected = this.itemSelectToggle(item);
        } else if (e.shiftKey) {
            selected = this.itemSelectRangeTo(item);
        } else {
            selected = this.itemSelectOne(item);
        }

        this.setState({
            selectedItems: selected,
            focusedItemIndex: this.state.items.indexOf(item)
        });
    },

    itemSelectAll: function() {
        this.setState({
            selectedItems: this.state.items
        });
    },

    itemSelectNone: function() {
        this.setState({
            selectedItems: []
        });
    },

    itemSelectOne: function(item) {
        return [item];
    },

    itemSelectToggle: function(item) {
        var items = this.state.selectedItems;

        // Toggle item on or off from the list.
        if (items.indexOf(item) >= 0) {
            items = _.without(items, item);
        } else {
            items.push(item);
        }

        return items;
    },

    itemSelectRangeTo: function(item) {
        var items = this.state.items;
        var selected = this.state.selectedItems;

        if (!selected.length) {
            this.itemSelectOne(item);
            return;
        }

        var lastIndex = items.indexOf(_.last(selected));
        var itemIndex = items.indexOf(item);

        var addition;
        if (itemIndex >= lastIndex) {
            addition = items.slice(lastIndex, itemIndex + 1);
        } else {
            addition = items.slice(itemIndex, lastIndex + 1);
        }

        selected = _.uniq(selected.concat(addition));

        return selected;
    },

    itemSelectPrev: function(e) {
        var items = this.state.items;

        var item = items[this.state.focusedItemIndex - 1];

        if (!item) {
            item = _.first(items);
        }

        if (item) {
            this.itemSelected(e, item);
        }
    },
    itemSelectNext: function(e) {
        var items = this.state.items;

        var item = items[this.state.focusedItemIndex + 1];

        if (!item) {
            item = _.last(items);
        }

        if (item) {
            this.itemSelected(e, item);
        }
    }
};

module.exports = SelectableListMixin;