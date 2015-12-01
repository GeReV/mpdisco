import React from 'react';

//var DraggableMixin = require('./../mixins/draggable_mixin.js');
import EnabledMixin from '../mixins/enabled_mixin.js';

export default React.createClass({

    mixins: [/*DraggableMixin, */EnabledMixin],

    statics: {
        getDragType: function() {
            return 'song';
        }
    },

    getDragItem: function() {
        return this.props.song;
    },

    render: function() {

        //var dragSourceAttributes;
        //
        //if (this.enabled()) {
        //    dragSourceAttributes = this.dragSource();
        //}

        return (
            <li className="library-item song"/* {...dragSourceAttributes}*/>
                <span className="name" title={this.props.song.title}>{this.props.song.title}</span>
            </li>
        );
    }
});
