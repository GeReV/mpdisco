var _ = require('underscore');

var DragDropMixin = require('../vendor/react-dnd/dist/ReactDND.min.js').DragDropMixin;

var DraggableMixin = _.extend({}, DragDropMixin, {

    statics: {
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

    handleDragStart: function(type, e) {
        DragDropMixin.handleDragStart.call(this, type, e);

        e.stopPropagation();
    },

    dragSource: function() {
        return this.dragSourceFor(this.constructor.getDragType());
    }
});

module.exports = DraggableMixin;