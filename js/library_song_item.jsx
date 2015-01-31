var React = require('./vendor/react/react.js');

var LibrarySongItem = React.createClass({
    events: {
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
    },

    render: function() {
        return (
            <li className="library-item song">
                <a className="name" href="#" data-id={this.props.song.name} title={this.song.props.name}>{this.props.song.name}</a>
            </li>
        );
    },

    onDomRefresh: function() {
        this.$el.attr('data-id', this.model.get('title'));

        this.$el.draggable({
            appendTo: '.library',
            distance: 2,
            scope: 'media',
            helper: function(e) {
                var item = $(e.currentTarget);

                return $('<div/>', {
                    'class': item.attr('class')
                }).html(item.html()).eq(0);
            }
        });
    },
    select: function(e) {
        MPDisco.vent.trigger('select:library', this);
    },
    add: function(e) {
        MPDisco.command('add', this.model.get('file'));

        return false;
    },
    dragstart: function(e, ui) {
        ui.helper.data('model', this.model.toJSON());

        e.stopPropagation();
    }
});

module.exports = LibrarySongItem;