var React = require('./vendor/react/react-with-addons.js');

var PlaylistItem = require('./playlist_item.jsx');

var Playlist = React.createClass({
    modelEvents: {
        change: 'updatePlaylist'
    },

    events: {
        'keyup #url': 'add',
        'dblclick li': 'play',
        'click li': 'selectClick',
        'drop': 'drop'
    },

    selectedSongs: [],

    getInitialState: function() {
        return {
            items: []
        };
    },

    componentWillMount: function() {
        MPDisco.network.command('playlistinfo');
    },

    render: function() {

        var items = this.state.items;

        items = items.map(function(item) {
            return <PlaylistItem key={item.id} item={item} />;
        });

        return (
            <div className="playlist">
                <header>
                    <span>Playlist</span>
                    <div className="playlist-tools button-group">
                        <input type="text" id="url" name="url" placeholder="Add a link" />
                        <span className="separator"></span>
                        <a className="shuffle" href="#" onclick={this.toggleShuffle}><i className="icon-random"></i></a>
                        <a className="repeat" href="#" onclick={this.toggleRepeat}><i className="icon-refresh"></i></a>
                        <span className="separator"></span>
                        <a className="remove disabled" href="#" onclick={this.remove}><i className="icon-trash"></i></a>
                    </div>
                </header>
                <div className="content"></div>
                <ul className="list">
                    {items}
                </ul>
            </div>
        );
    },

    onRender: function() {
        this.pluginsInitialized = false;
    },

    onCompositeCollectionRendered: function() {
        var that = this;

        this.ui.playlist.droppable({
            hoverClass: 'playlist-drop',
            scope: 'media'
        });

        this.ui.playlist.sortable({
            appendTo: this.$el,
            helper: function() {
                return document.createElement('ul');
            },
            placeholder: 'playlist-item-placeholder',
            opacity: 0.8,
            start: function(e, ui) {
                if (!ui.item.hasClass('selected')) {
                    that.select(ui.item);
                }

                var elements = ui.item.parent().children('.selected').not('.ui-sortable-placeholder');

                if (!elements.size()) {
                    elements = ui.item;
                }

                ui.helper.append(elements.clone(true).show());

                elements.hide();

                ui.item.data('multidrag', elements);
            },
            stop: function(e, ui) {
                var elements = ui.item.data('multidrag'),
                    i = elements.index(ui.item),
                    playlist = this.ui.playlist;

                ui.item.before(elements.slice(0, i));
                ui.item.after(elements.slice(i + 1));

                elements.show();

                commands = playlist.children().map(function(i, v) {
                    var el = $(v),
                        songid = el.data('songid');

                    return {
                        command: 'moveid',
                        args: [ songid, playlist.find('[data-songid="' + songid + '"]').index() ]
                    };
                }).toArray();

                MPDisco.commands(commands);

            }.bind(this)
        });

        this.ui.playlist.disableSelection();

        this.updatePlaylist();

        $.each(this.selectedSongs, function(i, v) {
            that.ui.playlist.find('[data-songid="' + v + '"]').addClass('selected');
        });

        this.pluginsInitialized = true;
    },

    //onShow: function() {
    //    $(document).on('keydown.playlist', this.handleKeyboard.bind(this));
    //},
    //
    //onClose: function() {
    //    $(document).off('keydown.playlist');
    //},

    //updatePlaylist: function(model) {
    //    model = model || this.model;
    //
    //    var songid = model.get('songid') || model.id;
    //
    //    if (songid) {
    //        this.ui.playlist
    //            .find('[data-songid="' + songid + '"]').addClass('current')
    //            .siblings().removeClass('current');
    //    }else{
    //        this.ui.playlist.children().removeClass('current');
    //    }
    //
    //    this.ui.shuffle.toggleClass('active', model.get('random') === '1');
    //    this.ui.repeat.toggleClass('active', model.get('repeat') === '1');
    //    this.ui.repeat.toggleClass('single', model.get('single') === '1');
    //},

    add: function(e) {
        var value = $.trim(this.ui.url.val());

        if (e.which === 0x0d && value) {
            MPDisco.command('add', value);

            this.ui.url.addClass('disabled loading');
        }

        return false;
    },

    //drop: function(e, ui) {
    //    var model = ui.helper.data('model'),
    //        args = [];
    //
    //    _.each(['artist', 'album', 'title'], function(key) {
    //        var value = model[key];
    //        if (value) {
    //            args.push(key);
    //            args.push(value);
    //        }
    //    });
    //
    //    if (args.length) {
    //        MPDisco.command('findadd', args);
    //    }
    //},

    //play: function(e) {
    //    var item = (e && e.currentTarget) ? $(e.currentTarget) : this.selectedItems.first();
    //
    //    MPDisco.network.command('playid', item.data('songid'));
    //
    //    return false;
    //},

    remove: function() {
        var commands = this.ui.playlist.find('.selected').map(function(i, v) {
            return {
                command: 'deleteid',
                args: [ $(v).data('songid') ]
            };
        }).toArray();

        MPDisco.commands(commands);

        return false;
    },

    toggleShuffle: function() {
        //var state = (~MPDisco.state.get('random') & 1);
        //
        //this.ui.shuffle.toggleClass('active', state);
        //
        //MPDisco.command('random', state);
        //
        //return false;
    },
    toggleRepeat: function() {
        //var repeat = +MPDisco.state.get('repeat'),
        //    single = +MPDisco.state.get('single');
        //
        //if (repeat && single) {
        //    this.ui.repeat.removeClass('active single');
        //
        //    MPDisco.commands([
        //        { command: 'repeat', args: 0 },
        //        { command: 'single', args: 0 }
        //    ]);
        //} else if (repeat) {
        //    this.ui.repeat.addClass('single');
        //
        //    MPDisco.command('single', 1);
        //}else {
        //    this.ui.repeat.addClass('active');
        //
        //    MPDisco.command('repeat', 1);
        //}
        //
        //return false;
    },

    selectClick: function(e) {
        this.ui.url.trigger('blur');

        this.select( e, $(e.currentTarget) );
    },

    select: function(e, item) {
        var itemTop, height, scrollTop;

        if (!item) {
            item = e;
        }

        if (e.currentTarget) {
            item = $(e.currentTarget);
        }

        if (!item.size()) {
            return;
        }

        if (e.ctrlKey || e.metaKey) {
            this.selectToggle(item);
        } else if (e.shiftKey) {
            this.selectRange(this.$('.selected').last(), item);
        } else if (!item.hasClass('selected')) {
            this.selectOne(item);
        }

        this.scrollIntoView(item);

        this.setRemoveButton();

        this.selectedSongs = this.$('.selected').map(function(i, v) {
            return $(v).data('songid');
        }).toArray();
    },
    selectAll: function() {
        var items = this.$('.playlist-item');

        this.selectRange(items.first(), items.last());

        this.setRemoveButton();
    },
    selectNone: function() {
        this.$('.selected').removeClass('selected');

        this.setRemoveButton();
    },
    selectOne: function(item) {
        item.addClass('selected')
            .siblings().removeClass('selected');

        this.setRemoveButton();
    },
    selectToggle: function(item) {
        item.toggleClass('selected');

        this.setRemoveButton();
    },
    selectRange: function(from, to) {
        var itemTop, height, scrollTop;

        if (!from && !to) {
            return;
        }

        if (!from.size()) {
            this.selectOne(to);

            return;
        }

        var selectedItems = (from.index() >= to.index()) ? from.prevUntil(to) : from.nextUntil(to);

        this.ui.playlist.children().removeClass('selected');

        selectedItems.addBack().add(to).addClass('selected');

        this.scrollIntoView(to);

        this.setRemoveButton();
    },
    selectPrev: function() {
        var item, itemTop;

        if (this.selectedSongs) {
            item = this.$('.selected').last().prev();
        }

        if (!item) {
            item = this.ui.playlist.children().first();
        }

        if (!item.size()) {
            item = this.ui.playlist.children().first();
        }

        this.select(item);

        return false;
    },
    selectNext: function() {
        var item, itemTop, height;

        if (this.selectedSongs) {
            item = this.$('.selected').last().next();
        }

        if (!item) {
            item = this.ui.playlist.children().first();
        }

        if (!item.size()) {
            item = this.ui.playlist.children().last();
        }

        this.select(item);

        return false;
    },
    scrollIntoView: function(item) {
        var scrollTop = this.ui.playlist.prop('scrollTop'),
            height = this.ui.playlist.height(),
            itemTop = item.position().top,
            itemHeight = item.outerHeight();

        if (itemTop < 0) {
            scrollTop += itemTop;
        } else if (itemTop + itemHeight > height) {
            scrollTop -= height - itemTop - itemHeight;
        }

        this.ui.playlist.prop('scrollTop', scrollTop);
    },

    setRemoveButton: function() {
        this.ui.remove.toggleClass('disabled', (this.$('.selected').length <= 0));
    },

    handleKeyboard: function(e) {
        var funcs = {
                0x0d: this.play,
                0x23: function(e) {
                    if (e.shiftKey) {
                        this.selectRange(this.$('.selected').last(), this.$('.playlist-item').last());
                    }else{
                        this.select(this.$('.playlist-item').last());
                    }

                    return false;
                },
                0x24: function(e) {
                    if (e.shiftKey) {
                        this.selectRange(this.$('.selected').last(), this.$('.playlist-item').first());
                    }else{
                        this.select(this.$('.playlist-item').first());
                    }

                    return false;
                },
                0x26: this.selectPrev,
                0x28: this.selectNext,
                0x2e: this.remove,
                0x41: function(e) {
                    if (e.ctrlKey) {
                        this.selectAll();

                        return false;
                    }
                },
                0x44: function(e) {
                    if (e.ctrlKey) {
                        this.selectNone();

                        return false;
                    }
                }
            },
            fn = funcs[e.which];

        if (fn) {
            return fn.call(this, e);
        }
    }
});

module.exports = Playlist;