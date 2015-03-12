var React = require('react/addons');

var _ = require('underscore');

var cx = React.addons.classSet;

var PlaylistTools = require('./playlist_tools.jsx');
var PlaylistItem = require('./playlist_item.jsx');
var ListView = require('./list_view.jsx');

var EnabledMixin = require('./mixins/enabled_mixin.js');
var PlaylistMixin = require('./mixins/playlist_mixin.js').PlaylistMixin;

var accepts = require('./mixins/playlist_mixin.js').accepts;

var Playlist = React.createClass({

    mixins: [PlaylistMixin, EnabledMixin],

    render: function() {

        var dropStates = accepts.map(this.getDropState);

        var enabled = this.enabled();

        var playlistClasses = cx({
            'playlist-drop': _.any(dropStates, function (state) {
                return state.isDragging || state.isHovering;
            }),
            'playlist-disabled': !enabled
        });

        var dropTargetAttributes;
        if (enabled) {
            dropTargetAttributes = this.dropTargetFor.apply(this, accepts);
        }

        return (
            <section id="playlist" className={playlistClasses} {...dropTargetAttributes}>
                <header>
                    <span>Playlist</span>
                    <PlaylistTools status={this.state.status} enabled={enabled} onShuffle={this.shuffle} onRepeat={this.repeat} onRemove={this.itemRemoved} />
                </header>
                <ListView
                    className="content list"
                    items={this.state.items}
                    itemCreator={this.itemCreator}
                    enabled={enabled}
                    onItemActivated={this.itemPlayed}
                    onItemRemoved={this.itemRemoved}
                    onItemSelected={this.itemSelected}
                    onItemsReordered={this.itemsReordered}/>
                <div className="lock">
                    <i className="icon-lock" />
                    <span>You are not the current DJ</span>
                </div>
            </section>
        );
    },

    itemCreator: function(item) {
        var playing  = (this.state.playingItemId === item.id);

        return (
            <PlaylistItem
                key={item.id}
                item={item}
                enabled={this.enabled()}
                playing={playing}
            />
        );
    }
});

module.exports = Playlist;