define(['mpdisco', 'vendor/jquery.iframe-transport', 'vendor/jquery.fileupload', 'vendor/jquery.fileupload-validate'], function(MPDisco) {
  
  var Library = MPDisco.module('Library', function(Library, MPDisco, Backbone, Marionette, $) {
    
    Library.Artist = MPDisco.Model.extend({
      defaults: {
        artist: 'Artist'
      }
    });
    
    Library.ArtistCollection = MPDisco.Collection.extend({
      model: Library.Artist,
      
      socketEvents: {
        'list:artist': 'update'
      },
      
      update: function(response) {
        this.reset(response.data);
      }
    });
    
    Library.Song = MPDisco.Model.extend({
      defaults: {
        song: 'Song'
      }
    });
    
    Library.SongCollection = MPDisco.Collection.extend({
      model: Library.Song,
      
      socketEvents: {
        'find': 'update'
      },
      
      update: function(response) {
        var filter = response.args.join(' ');
        
        if (filter === this.filter) {
          this.reset(response.data);
          
          this.socketOff('find'); // Makes sure this is run only once.
        }
      }
    });
    
    Library.Album = MPDisco.Model.extend({
      defaults: {
        title: 'Album',
        year: null
      }
    });
    
    Library.AlbumCollection = MPDisco.Collection.extend({
      model: Library.Album,
      
      socketEvents: {
        'list:album': 'update'
      },
      
      filter: null,
      
      update: function(response) {
        var filter = response.args[0];
        
        if (filter === this.filter) {
          this.reset(response.data);
          
          this.socketOff('list:album'); // Makes sure this is run only once.
        }
      }
    });
    
    Library.LibrarySongView = Marionette.ItemView.extend({
      tagName: 'li',
      
      className: 'song',
      
      template: '#song_template',
      
      events: {
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
      },
      
      ui: {
        name: '.name'
      },
      
      onDomRefresh: function() {
        this.$el.attr('data-id', this.model.get('title'));
        
        this.$el.draggable({
          distance: 2,
          helper: 'clone',
          scope: 'media'
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
    
    Library.LibraryAlbumView = Marionette.CompositeView.extend({
      tagName: 'li',
      
      className: 'album',
      
      template: '#album_template',
      
      events: {
        'click > .name': 'toggleSongs',
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
      },
      
      ui: {
        songs: '.songs',
        name: '.name'
      },
      
      itemView: Library.LibrarySongView,
      itemViewContainer: '.tree',
      
      initialize: function() {
        this.collection = new Library.SongCollection; 
      },
      
      onDomRefresh: function() {
        this.$el.attr('data-id', this.model.get('album'));
        
        this.$el.draggable({
          distance: 2,
          helper: 'clone',
          scope: 'media'
        });
      },
      
      loaded: false,
      
      toggleSongs: function(e) {
        var albumEl = $(e.currentTarget).toggleClass('open'),
            artistEl = albumEl.closest('.artist').find('.name'),
            album = albumEl.data('id'),
            artist = artistEl.data('id');
        
        this.ui.songs.toggleClass('collapsed');
        
        if (!this.loaded) {
          
          this.collection.filter = artist + ' ' + album;
          
          MPDisco.command('find', ['artist', artist, 'album', album]);
          
          this.loaded = true;
        }
        
        return false;
      },
      
      select: function(e) {
        MPDisco.vent.trigger('select:library', this);
      },
      add: function(e) {
        var albumEl = $(e.currentTarget),
            artistEl = albumEl.closest('.artist').find('.name'),
            album = albumEl.data('id'),
            artist = artistEl.data('id');
            
        MPDisco.command('findadd', ['artist', artist, 'album', album]);
        
        return false;
      },
      
      dragstart: function(e, ui) {
        var album = this.model.get('album'),
            artist = this.$el.closest('.artist').data('id');
            
        $(ui.helper).data('model', {
          album: album,
          artist: artist
        });
        
        e.stopPropagation();
      }
    });
    
    Library.LibraryArtistView = Marionette.CompositeView.extend({
      tagName: 'li',
      
      className: 'artist',
      
      template: '#artist_template',
      
      events: {
        'click > .name': 'toggleAlbums',
        'mousedown > .name': 'select',
        'dblclick > .name': 'add',
        'dragstart': 'dragstart'
      },
      
      ui: {
        albums: '.albums',
        name: '.name'
      },
      
      itemView: Library.LibraryAlbumView,
      itemViewContainer: '.tree',
      
      initialize: function() {
        this.collection = new Library.AlbumCollection; 
      },
      
      onDomRefresh: function() {
        this.$el.attr('data-id', this.model.get('artist'));
        
        this.$el.draggable({
          distance: 2,
          helper: 'clone',
          scope: 'media'
        });
      },
      
      loaded: false,
      
      toggleAlbums: function(e) {
        var artistEl = $(e.currentTarget).toggleClass('open'),
            artist = artistEl.data('id');
        
        this.ui.albums.toggleClass('collapsed');
        
        if (!this.loaded) {
          
          this.collection.filter = artist;
          
          MPDisco.command('list', ['album', artist]);
          
          this.loaded = true;
        }
        
        return false;
      },
      
      select: function(e) {
        MPDisco.vent.trigger('select:library', this);
      },
      
      add: function(e) {
        var artistEl = $(e.currentTarget),
            artist = artistEl.data('id');
            
        MPDisco.command('findadd', ['artist', artist]);
        
        return false;
      },
      
      dragstart: function(e, ui) {
        var artist = this.model.get('artist');
        
        $(ui.helper).data('model', {
          artist: artist
        });
        
        e.stopPropagation();
      }
    });
    
    Library.LibraryView = Marionette.CompositeView.extend({
      template: '#library_template',
      
      className: 'library',
      
      collection: new Library.ArtistCollection,
      
      itemView: Library.LibraryArtistView,
      itemViewContainer: '.tree',
      
      ui: {
        files: '#fileupload',
        library: '.tree',
        overlay: '#overlay'
      },
      
      events: {
        'drop #overlay': 'drop',
        'dragleave #overlay': 'clearDrop',
        'dragend #overlay': 'clearDrop'
      },
      
      initialize: function() {
        MPDisco.command('list', 'artist');
        
        this.listenTo(MPDisco.vent, 'select:library', this.select);
      },
      
      select: function(view) {
        this.$('li').removeClass('selected');
        
        view.$el.addClass('selected');
      },
      
      onShow: function() {
        var that = this;
        
        $(document).on('dragenter.library', function() {
          that.$el.addClass('library-drop');
          that.ui.overlay.addClass('show');
        });
      },
      onClose: function() {
        $(document).off('dragover.library');
      },
      
      onRender: function() {
        var that = this;
        
        this.ui.files.fileupload({
          add: function(e, data) {
            if (data.files.length) {
              that.upload(data);
            }
          },
          progress: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            
            console.log(progress);
          }
        });
      },
      
      drop: function() {
        this.clearDrop();
      },
      
      clearDrop: function() {
        this.$el.removeClass('library-drop');
        this.ui.overlay.removeClass('show');
      },
      
      upload: function(data) {
        data.submit();
      },
    });
  });
  
  return Library;
});