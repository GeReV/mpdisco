var React = require('react/addons');

var cx = React.addons.classSet;

var PropTypes = React.PropTypes;

var EnabledMixin = require('./../mixins/enabled_mixin.js');
var DragDropMixin = require('react-dnd').DragDropMixin;

function formatTime(seconds) {
    function zeroPad(n) {
        return n < 10 ? '0' + n : n;
    }
    return Math.floor(seconds / 60) + ':' + zeroPad(seconds % 60);
}

var PlaylistItem = React.createClass({
    mixins: [DragDropMixin, EnabledMixin],

    propTypes: {
        onReorder: PropTypes.func.isRequired,
        onDidReorder: PropTypes.func.isRequired
    },

    statics: {
        getDragType: function() {
            return 'playlist-item';
        },

        configureDragDrop: function(register) {
            register(this.getDragType(), {
                dragSource: {
                    beginDrag: function(component) {
                        return {
                            item: component.props.item
                        };
                    },
                    endDrag: function(component) {
                        component.props.onDidReorder();
                    }
                },

                dropTarget: {
                    over: function(component, item) {
                        component.props.onReorder(item, component.props.item);
                    }
                }
            });
        }
    },

    render: function() {

        var dragType = this.constructor.getDragType();

        var item = this.props.item;

        var details;

        if (item.title) {
            details = [];

            if (item.artist) {
                details.push(
                    <span className="artist" key="artist">{item.artist}</span>
                );

                if (item.album) {
                    details.push(<span className="sep" key="sep-album">,&nbsp;</span>);
                    details.push(
                        <span className="album" key="album">{item.album}</span>
                    );
                }

                if (item.date) {
                    details.push(<span className="sep" key="sep-date">,&nbsp;</span>);
                    details.push(
                        <span className="year" key="year">{item.date}</span>
                    );
                }
            }

            details =
                <div className="song">
                    <p className="title">{item.title}</p>
                    <p className="details">
                        {details}
                    </p>
                </div>;
        } else {
            details = <span className="url">{item.file}</span>
        }

        var time = formatTime(+this.props.item.time);

        var classes = cx({
            'playlist-item': true,
            'playlist-item-selected': this.props.selected,
            'playlist-item-playing': this.props.playing,
            'playlist-item-focus': this.props.focused,
            'playlist-item-dragging': this.getDragState(dragType).isDragging
        });

        var events,
            dragSourceAttributes,
            dropTargetAttributes;

        if (this.enabled()) {
            events = {
                onMouseDown: this.itemClick,
                onDoubleClick: this.itemDblClick
            };

            dragSourceAttributes = this.dragSourceFor(dragType);
            dropTargetAttributes = this.dropTargetFor(dragType);
        }

        return (
            <li
                className={classes}
                {...events}
                {...dragSourceAttributes}
                {...dropTargetAttributes}
            >
                <div className="image" />
                {details}
                <span className="time">{time}</span>
            </li>
        );
    },

    itemClick: function(e) {
        if (this.props.onItemClick) {
            this.props.onItemClick(e, this.props.item);
        }
    },

    itemDblClick: function(e) {
        if (this.props.onItemDblClick) {
            this.props.onItemDblClick(e, this.props.item);
        }

        e.preventDefault();
    }
});

module.exports = PlaylistItem;