import React from 'react';
//var DragDropMixin = require('react-dnd').DragDropMixin;

import MPDiscoController from '../mpdisco_controller.js';

import { tree } from '../mpdisco_model.js';

const accepts = ['artist', 'album', 'song'];

export default {
    mixins: [/*DragDropMixin, */tree.mixin],

    cursors: {
        items: ['playlist'],
        status: ['status'],
        song: ['currentsong']
    },

    propTypes: {
        controller: React.PropTypes.instanceOf(MPDiscoController).isRequired
    },

    //statics: {
    //    configureDragDrop: function(register) {
    //        accepts.forEach(function(itemType) {
    //            register(itemType, {
    //                dropTarget: {
    //                    acceptDrop: function(component, item) {
    //                        component.props.controller.playlistAddItem(itemType, item);
    //                    }
    //                }
    //            });
    //        });
    //    }
    //},

    getInitialState: function() {
        return {
            animations: false,
            selectedItems: []
        };
    },

    componentDidMount: function() {
        // Turn library update animations on.
        this.setState({
            animations: true
        });
    },

    itemPlayed: function(item) {
        this.props.controller.play(item.id);
    },

    itemRemoved: function(items) {
        this.props.controller.playlistRemoveItems(items || this.state.selectedItems);
    },

    itemsSelected: function(items) {
        this.setState({
            selectedItems: items
        });
    },

    itemsReordered: function(items) {
        this.setState({
            items: items
        });
        this.props.controller.playlistReorderItems(items);
    },

    repeat: function(repeat, single) {
        if (repeat && single) {
            // Both on, turn both off.
            this.props.controller.toggleRepeat(0, 0);
        } else if (repeat) {
            // Repeat on, turn single on.
            this.props.controller.toggleRepeat(1, 1);
        } else {
            // Both off, turn repeat on.
            this.props.controller.toggleRepeat(1, 0);
        }
    },

    shuffle: function(shuffle) {
        this.props.controller.toggleShuffle(shuffle);
    }
};

export default accepts;
