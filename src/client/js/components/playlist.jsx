import React, { Component } from 'react';
import cx from 'classnames';
import { nuclearComponent } from 'nuclear-js-react-addons';

import actions from '../actions';
import getters from '../getters';

import PlaylistControls from './playlist_controls.jsx';
import PlaylistItem from './playlist_item.jsx';
import ListView from './list_view.jsx';

import withEnabled from '../decorators/withEnabled';
import withStyles from '../decorators/withStyles';

import styles from '../../sass/playlist.scss';

// import { PlaylistMixin } from '../mixins/playlist_mixin.js';

// import { accepts } from '../mixins/playlist_mixin.js';

@nuclearComponent(props => {
  return {
    items: getters.playlist
  };
})
@withStyles(styles)
@withEnabled
class Playlist extends Component {

    constructor() {
      super();

      this.state = {
          animations: false,
          selectedItems: []
      };
    }

    componentDidMount() {
      // Turn library update animations on.
      this.setState({
          animations: true
      });
    }

    render() {
        //var dropStates = accepts.map(this.getDropState);

        const enabled = this.props.enabled;

        const playlistClasses = cx({
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
            <section id="playlist" className={playlistClasses}>
                <header>
                    <span>Playlist</span>
                    <PlaylistControls status={this.props.status}
                                      enabled={enabled}
                                      onShuffle={this.shuffle}
                                      onRepeat={this.repeat}
                                      onRemove={this.itemRemoved} />
                </header>
                <ListView
                    className="content list"
                    items={this.props.items}
                    itemCreator={this.itemCreator}
                    enabled={enabled}
                    onItemActivated={this.itemPlayed}
                    onItemRemoved={this.itemRemoved}
                    onItemsSelected={this.itemsSelected}
                    onItemsReordered={this.itemsReordered} />
                <div className="lock">
                    <i className="icon-lock" />
                    <span>You are not the current DJ</span>
                </div>
            </section>
        );
    }

    itemCreator(item) {
        const song = this.props.song;
        const isPlaying = (song && song === item);

        return (
            <PlaylistItem
                key={item.id}
                item={item}
                enabled={this.enabled()}
                playing={isPlaying}
            />
        );
    }

    itemPlayed(item) {
        actions.play(item.id);
    }

    itemRemoved(items) {
        actions.playlistRemoveItems(items || this.state.selectedItems);
    }

    itemsSelected(items) {
        this.setState({
            selectedItems: items
        });
    }

    itemsReordered(items) {
        this.setState({
            items: items
        });
        actions.playlistReorderItems(items);
    }

    repeat(repeat, single) {
        if (repeat && single) {
            // Both on, turn both off.
            actions.toggleRepeat(0, 0);
        } else if (repeat) {
            // Repeat on, turn single on.
            actions.toggleRepeat(1, 1);
        } else {
            // Both off, turn repeat on.
            actions.toggleRepeat(1, 0);
        }
    }

    shuffle(shuffle) {
        actions.toggleShuffle(shuffle);
    }
}

export default Playlist;
