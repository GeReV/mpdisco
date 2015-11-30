var React = require('react/addons');

var _ = require('lodash');

var cx = React.addons.classSet;

var PlaylistControls = require('./playlist_controls.jsx');
var PlaylistItem = require('./playlist_item.jsx');
var ListView = require('./list_view.jsx');

var EnabledMixin = require('./../mixins/enabled_mixin.js');
var PlaylistMixin = require('./../mixins/playlist_mixin.js').PlaylistMixin;

var accepts = require('./../mixins/playlist_mixin.js').accepts;

var tree = require('./../mpdisco_model.js').tree;

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
                    <PlaylistControls status={this.cursors.status.get()} enabled={enabled} onShuffle={this.shuffle} onRepeat={this.repeat} onRemove={this.itemRemoved} />
                </header>
                <ListView
                    className="content list"
                    items={this.cursors.items.get()}
                    itemCreator={this.itemCreator}
                    enabled={enabled}
                    onItemActivated={this.itemPlayed}
                    onItemRemoved={this.itemRemoved}
                    onItemsSelected={this.itemsSelected}
                    onItemsReordered={this.itemsReordered}/>
                <div className="lock">
                    <i className="icon-lock" />
                    <span>You are not the current DJ</span>
                </div>
            </section>
        );
    },

    itemCreator: function(item) {
        var song = this.cursors.song.get();
        var isPlaying = (song && song.id === item.id);

        return (
            <PlaylistItem
                key={item.id}
                item={item}
                enabled={this.enabled()}
                playing={isPlaying}
            />
        );
    }
});

module.exports = Playlist;
