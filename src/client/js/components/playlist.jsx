import React, { Component } from 'react';
import cx from 'classnames';

import _ from 'lodash';


import PlaylistControls from './playlist_controls.jsx';
import PlaylistItem from './playlist_item.jsx';
import ListView from './list_view.jsx';

import EnabledMixin from '../mixins/enabled_mixin.js';
import { PlaylistMixin } from '../mixins/playlist_mixin.js';

import { accepts } from '../mixins/playlist_mixin.js';

import { tree } from '../mpdisco_model.js';

export default React.createClass({

    mixins: [PlaylistMixin, EnabledMixin],

    render: function() {

        //var dropStates = accepts.map(this.getDropState);

        var enabled = this.enabled();

        var playlistClasses = cx({
            //'playlist-drop': _.any(dropStates, function (state) {
            //    return state.isDragging || state.isHovering;
            //}),
            'playlist-disabled': !enabled
        });

        //var dropTargetAttributes;
        //if (enabled) {
        //    dropTargetAttributes = this.dropTargetFor.apply(this, accepts);
        //}

        return (
            <section id="playlist" className={playlistClasses}/* {...dropTargetAttributes}*/>
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
