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
      
      className: 'library-item song',
      
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
    
    Library.LibraryAlbumView = Marionette.CompositeView.extend({
      tagName: 'li',
      
      className: 'library-item album',
      
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
      
      className: 'library-item artist',
      
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
        overlay: '#overlay',
        files: '#fileupload',
        library: '.tree',
        upload: '.upload'
      },
      
      events: {
        'drop #overlay': 'drop',
        'dragleave #overlay': 'clearDrop',
        'dragend #overlay': 'clearDrop',
        'fileuploadadd': 'createProgress',
        'fileuploadprocessstart': 'startProgress',
        'fileuploadprogress': 'showProgress',
        'fileuploaddone': 'finishProgress',
        'fileuploadfail': 'failProgress'
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
        });
      },
      onClose: function() {
        $(document).off('dragover.library');
      },
      
      onRender: function() {
        var that = this;
        
        this.ui.files.fileupload({
          autoUpload: true,
          sequentialUploads: true
        });
      },
      
      drop: function() {
        this.clearDrop();
      },
      
      clearDrop: function() {
        this.$el.removeClass('library-drop');
      },
      
      startProgress: function() {
        this.$el.addClass('uploading');
      },
      finishProgress: function(e, data) {
        data.context.addClass('finished');
        
        if (!this.ui.upload.children().not('.finished').length) {
          // Finished upload batch.
          
          this.ui.upload.empty();
          
          this.$el.removeClass('library-drop uploading');
          
          MPDisco.command('update');
        }
      },
      createProgress: function(e, data) {
        if (data.files.length) {
          data.context = $('<li><span class="filename">' + data.files[0].name + '</span><span class="progress-bar"><span class="progress"></span></span></li>').appendTo(this.ui.upload);
        }
      },
      showProgress: function(e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10),
            itemTop = data.context.position().top,
            itemHeight = data.context.height(),
            height = this.ui.upload.height();
        
        if (itemTop > height) {
          this.ui.upload.prop('scrollTop', itemTop + itemHeight - height);
        }
        
        data.context.find('.progress').css('width', progress + '%');
      },
      failProgress: function(e, data) {
        data.context.addClass('failed');
      }
    });
  });
  
  return Library;
});