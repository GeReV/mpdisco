define(['mpdisco'], function(MPDisco) {  
  var Playlist = MPDisco.module('Playlist', function(Playlist, MPDisco, Backbone, Marionette, $, _) {
    
    Playlist.Collection = MPDisco.Collection.extend({
      socketEvents: {
        playlistinfo: 'reset'
      }
    });
      
    Playlist.PlaylistItemView = Marionette.ItemView.extend({
      tagName: 'li',
      
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
        currentsong: 'updatePlaylist'
      },
      
      collectionEvents: {
        reset: 'render'
      },
      
      events: {
        'click .add': 'add',
        'click .remove': 'remove',
        'dblclick li': 'play',
        'click li': 'select'
      },
      
      selectedItem: null,
      
      initialize: function() {
        MPDisco.network.command('playlistinfo');
        
        this.listenTo(MPDisco.state, 'change:songid', this.updatePlaylist);
      },
      
      onDomRefresh: function() {
        this.updatePlaylist(MPDisco.state.toJSON());
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
        MPDisco.network.command('add', this.ui.url.val());
      },
      
      play: function(e) {
        var item = (e && e.currentTarget) ? $(e.currentTarget) : this.selectedItem;
        
        MPDisco.network.command('playid', item.data('songid'));
      },
      
      remove: function() {
        if (this.selectedItem && this.selectedItem.size()) {
          MPDisco.network.command('deleteid', this.selectedItem.attr('data-songid'));
        }
      },
      
      select: function(e) {
        this.selectedItem = e;
        
        if (e.currentTarget) {
          this.selectedItem = $(e.currentTarget);
        }
        
        this.ui.remove.prop('disabled', false)
        
        this.selectedItem.addClass('selected')
          .siblings().removeClass('selected');
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
