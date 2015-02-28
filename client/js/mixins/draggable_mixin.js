var _ = require('underscore');

var DragDropMixin = require('../vendor/react-dnd/dist/ReactDND.min.js').DragDropMixin;

var DraggableMixin = _.extend({}, DragDropMixin, {
    handleDragStart: function(type, e) {
        DragDropMixin.handleDragStart.call(this, type, e);

        e.stopPropagation();
    }
});

module.exports = DraggableMixin;