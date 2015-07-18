var React = require('react/addons');
var _ = require('underscore');

var HotKey = require('react-hotkey');

var SelectableListMixin = require('./../mixins/selectable_list_mixin.js');
var SortableMixin = require('./../mixins/sortable_mixin.js');
var EnabledMixin = require('./../mixins/enabled_mixin.js');

HotKey.activate('keydown');

var ListView = React.createClass({
    mixins: [
        SelectableListMixin,
        SortableMixin,
        EnabledMixin,
        HotKey.Mixin('handleKeyboard')
    ],

    propTypes: {
        items: React.PropTypes.array.isRequired,
        itemCreator: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            items: [],
            selectedItems: [],
            focusedItemIndex: 0
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            items: nextProps.items
        });
    },

    render: function() {
        var items = this.state.items;

        var children = items.map(function(item, i) {
            // Delegate item creation to the parent element.
            var child = this.props.itemCreator(item);

            var selected = (this.state.selectedItems.indexOf(item) >= 0);
            var focused  = (this.state.focusedItemIndex === i);

            _.extend(child.props, {
                selected: selected,
                focused: focused,
                onItemClick: this.itemSelected,
                onItemDblClick: this.itemActivated,
                onReorder: this.reorder,
                onDidReorder: this.reordered
            });

            return child;
        }, this);

        return (
            <ul className={this.props.className}>
                {children}
            </ul>
        );
    },

    itemActivated: function(e, item) {
        if (this.props.onItemActivated && this.enabled()) {
            this.props.onItemActivated(item);
        }

        e.preventDefault();
    },

    itemsRemoved: function(e) {
        if (this.props.onItemRemoved && this.enabled()) {
            this.props.onItemRemoved(this.state.selectedItems);
        }

        e.preventDefault();
    },

    reordered: function() {
        if (this.props.onItemsReordered && this.enabled()) {
            this.props.onItemsReordered(this.state.items);
        }
    },

    handleKeyboard: function(e) {
        if (!this.enabled()) {
            return;
        }

        var funcs = {
            'Delete': this.itemsRemoved,
            'Enter': function(e) {
                var item = _.first(this.state.selectedItems);

                if (item) {
                    this.itemActivated(e, item);
                }
            },
            'Home': function(e) {
                this.itemSelectFirst(e);

                e.preventDefault();
            },
            'End': function(e) {
                this.itemSelectLast(e);

                e.preventDefault();
            },
            'ArrowUp': this.itemSelectPrev,
            'ArrowDown': this.itemSelectNext,

            65: function(e) { // Ctrl+A
                if (e.ctrlKey) {
                    this.itemSelectAll();

                    e.preventDefault();
                }
            },
            68: function(e) { // Ctrl+D
                if (e.ctrlKey) {
                    this.itemSelectNone();

                    e.preventDefault();
                }
            }
        };

        var fn = funcs[e.key] || funcs[e.keyCode];

        if (fn) {
            return fn.call(this, e);
        }
    },

    scrollIntoView: function(item) {
        var scrollTop = this.ui.playlist.prop('scrollTop'),
            height = this.ui.playlist.height(),
            itemTop = item.position().top,
            itemHeight = item.outerHeight();

        if (itemTop < 0) {
            scrollTop += itemTop;
        } else if (itemTop + itemHeight > height) {
            scrollTop -= height - itemTop - itemHeight;
        }

        this.ui.playlist.prop('scrollTop', scrollTop);
    }
});

module.exports = ListView;