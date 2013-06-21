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
        remove: '.remove'
      },
      
      collection: new Playlist.Collection,
      
      itemView: Playlist.PlaylistItemView,
      itemViewContainer: '.list',
      
      socketEvents: {
        status: 'updatePlaylist',
        currentsong: 'updatePlaylist',
      },
      
      collectionEvents: {
        reset: 'render'
      },
      
      events: {
        'click .add': 'add',
        'click .remove': 'remove',
        'dblclick li': 'play',
        'click li': 'select',
        'drop': 'drop'
      },
      
      selectedSongs: [],
      
      initialize: function() {
        MPDisco.network.command('playlistinfo');
        
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
        
        this.updatePlaylist(MPDisco.state.toJSON());
        
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
      
      updatePlaylist: function(status) {
        var songid = status.songid || status.id;
        
        if (songid) {
          this.ui.playlist
            .find('[data-songid="' + songid + '"]').addClass('current')
            .siblings().removeClass('current');
        }else{
          this.ui.playlist.children().removeClass('current');
        }
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
      },
      
      remove: function() {
        var commands = this.ui.playlist.find('.selected').map(function(i, v) {
          return {
            command: 'deleteid',
            args: [ $(v).data('songid') ]
          };
        }).toArray();
          
        MPDisco.commands(commands);
      },
      
      select: function(e) {
        var item = e;
        
        if (e.currentTarget) {
          item = $(e.currentTarget);
        }
        
        if (!item.size()) {
          return;
        }
        
        this.ui.remove.prop('disabled', false);
        
        if (e.ctrlKey || e.metaKey) {
          this.selectToggle(item);
        } else if (e.shiftKey) {
          this.selectRange(this.$('.selected').last(), item);
        } else if (!item.hasClass('selected')) {
          this.selectOne(item);
        }
        
        this.selectedSongs = this.$('.selected').map(function(i, v) {
          return $(v).data('songid');
        }).toArray();
      },
      
      selectOne: function(item) {
        item.addClass('selected')
          .siblings().removeClass('selected');
      },
      
      selectToggle: function(item) {
        item.toggleClass('selected');
      },
      
      selectRange: function(from, to) {
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
      },
      
      selectPrev: function() {
        var item;
        
        if (this.selectedItem) {
          item = this.selectedItem.prev();
        }
        
        if (!item) {
          item = this.ui.playlist.children().first();
        }
        
        if (!item.size()) {
          item = this.ui.playlist.children().first();
        }
        
        this.select(item);
        
        //this.ui.playlist.scrollTo(item)
      },
      
      selectNext: function() {
        var item;
        
        if (this.selectedItem) {
          item = this.selectedItem.next();
        }
        
        if (!item) {
          item = this.ui.playlist.children().first();
        }
        
        if (!item.size()) {
          item = this.ui.playlist.children().last();
        }
        
        this.select(item);
        
        //this.ui.playlist.scrollTo(item)
      },
      
      handleKeyboard: function(e) {
        var funcs = {
          0x0d: this.play,
          0x26: this.selectPrev,
          0x28: this.selectNext,
          0x2e: this.remove
        },
        fn = funcs[e.which];
        
        if (fn) {
          fn.call(this);
          
          return false;
        }
      }
    });
  
  });
  
  return Playlist;
});
