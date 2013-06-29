define(['mpdisco'], function(MPDisco) {  
  var Playlist = MPDisco.module('Playlist', function(Playlist, MPDisco, Backbone, Marionette, $, _) {
    
    Playlist.Collection = MPDisco.Collection.extend({
      socketEvents: {
        playlistinfo: 'reset'
      }
    });
      
    Playlist.PlaylistItemView = Marionette.ItemView.extend({
      tagName: 'li',
      
      className: 'playlist-item',
      
      template: '#playlist_item_template',
      
      onDomRefresh: function() {
        this.$el.attr('data-songid', this.model.id);
      }
    });
    
    Playlist.PlaylistView = Marionette.CompositeView.extend({
      template: '#playlist_template',
      
      className: 'playlist',
      
      ui: {
        playlist: 'ul',
        url: '#url',
        remove: '.remove',
        shuffle: '.shuffle',
        repeat: '.repeat'
      },
      
      model: MPDisco.state,
      
      collection: new Playlist.Collection,
      
      itemView: Playlist.PlaylistItemView,
      itemViewContainer: '.list',
      
      collectionEvents: {
        reset: 'render'
      },
      
      modelEvents: {
        change: 'updatePlaylist'
      },
      
      events: {
        'click .add': 'add',
        'click .remove': 'remove',
        'dblclick li': 'play',
        'click li': 'select',
        'drop': 'drop',
        'click .shuffle': 'toggleShuffle',
        'click .repeat': 'toggleRepeat'
      },
      
      selectedSongs: [],
      
      initialize: function() {
        MPDisco.command('playlistinfo');
        
        this.listenTo(MPDisco.state, 'change:songid', this.updatePlaylist);
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
            
            ui.item.before(elements.slice(0, i))
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
      },
      
      onShow: function() {
        $(document).on('keydown.playlist', this.handleKeyboard.bind(this));
      },
      
      onClose: function() {
        $(document).off('keydown.playlist');
      },
      
      updatePlaylist: function(model) {
        model = model || this.model;
        
        var songid = model.get('songid') || model.id;
        
        if (songid) {
          this.ui.playlist
            .find('[data-songid="' + songid + '"]').addClass('current')
            .siblings().removeClass('current');
        }else{
          this.ui.playlist.children().removeClass('current');
        }
        
        this.ui.shuffle.toggleClass('active', model.get('random') === '1');
        this.ui.repeat.toggleClass('active', model.get('repeat') === '1');
        this.ui.repeat.toggleClass('single', model.get('single') === '1');
      },
      
      add: function() {
        MPDisco.command('add', this.ui.url.val());
      },
      
      drop: function(e, ui) {
        var model = ui.helper.data('model'),
            args = [];
            
        _.each(['artist', 'album', 'title'], function(key) {
          var value;
          if (value = model[key]) {
            args.push(key);
            args.push(value);
          }
        });
        
        if (args.length) {
          MPDisco.command('findadd', args);
        }
      },
      
      play: function(e) {
        var item = (e && e.currentTarget) ? $(e.currentTarget) : this.selectedItems.first();
        
        MPDisco.network.command('playid', item.data('songid'));
        
        return false;
      },
      
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
        var state = (~MPDisco.state.get('random') & 1);
        
        this.ui.shuffle.toggleClass('active', state);
        
        MPDisco.command('random', state);
        
        return false;
      },
      toggleRepeat: function() {
        var repeat = +MPDisco.state.get('repeat'),
            single = +MPDisco.state.get('single');
            
        if (repeat && single) {
          this.ui.repeat.removeClass('active single');
          
          MPDisco.commands([
            { command: 'repeat', args: 0 },
            { command: 'single', args: 0 }
          ]);
        } else if (repeat) {
          this.ui.repeat.addClass('single');
          
          MPDisco.command('single', 1);
        }else {
          this.ui.repeat.addClass('active');
          
          MPDisco.command('repeat', 1);
        }
        
        return false;
      },
      
      select: function(e) {
        var item = e, itemTop, height, scrollTop;
        
        if (e.currentTarget) {
          item = $(e.currentTarget);
        }
        
        if (!item.size()) {
          return;
        }
        
        this.ui.remove.removeClass('disabled');
        
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
        
        this.ui.remove.addClass('disabled');
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
            itemTop = item.position().top;
            
        if (itemTop < 0) {
          scrollTop += itemTop;
        } else if (itemTop > height) {
          scrollTop -= height + item.height();
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
  
  });
  
  return Playlist;
});
