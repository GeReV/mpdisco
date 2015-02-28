var React = require('./vendor/react/react-with-addons.js');

var DraggableMixin = require('./mixins/draggable_mixin.js');

var LibrarySongItem = React.createClass({

    mixins: [DraggableMixin],

    statics: {
        getDragType: function() {
            return 'song';
        },

        configureDragDrop: function(register) {
            register(this.getDragType(), {
                dragSource: {
                    beginDrag: function(component) {
                        return {
                            item: component.getDragItem()
                        };
                    }
                }
            });
        }
    },

    getDragItem: function() {
        return this.props.song;
    },

    render: function() {
        return (
            <li className="library-item song" {...this.dragSourceFor('song')}>
                <span className="name" title={this.props.song.title}>{this.props.song.title}</span>
            </li>
        );
    },

    select: function(e) {
        MPDisco.vent.trigger('select:library', this);
    },
    add: function(e) {
        MPDisco.command('add', this.model.get('file'));

        return false;
    }
});

module.exports = LibrarySongItem;