var React = require('react/addons');

var DraggableMixin = require('./mixins/draggable_mixin.js');

var LibrarySongItem = React.createClass({

    mixins: [DraggableMixin],

    statics: {
        getDragType: function() {
            return 'song';
        }
    },

    getDragItem: function() {
        return this.props.song;
    },

    render: function() {
        return (
            <li className="library-item song" {...this.dragSource()}>
                <span className="name" title={this.props.song.title}>{this.props.song.title}</span>
            </li>
        );
    }
});

module.exports = LibrarySongItem;