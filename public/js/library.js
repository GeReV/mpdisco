define(['mpdisco'], function(MPDisco) {
  var Library = MPDisco.module('Library', function(Library, MPDisco, Backbone, Marionette) {
    
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
        'click .name': 'select',
        'dblclick .name': 'add'
      },
      
      ui: {
        name: '.name'
      },
      
      select: function(e) {
        MPDisco.vent.trigger('select:library', this);
        
        return false;
      },
      
      add: function(e) {
        MPDisco.command('add', this.model.get('file'));
        
        return false;
      }
    });
    
    Library.LibraryAlbumView = Marionette.CompositeView.extend({
      tagName: 'li',
      
      className: 'album',
      
      template: '#album_template',
      
      events: {
        'click .name': 'select',
        'dblclick .name': 'add'
      },
      
      ui: {
        songs: '.songs',
        name: '.name'
      },
      
      initialize: function() {
        this.collection = new Library.SongCollection; 
      },
      
      itemView: Library.LibrarySongView,
      itemViewContainer: '.tree',
      
      loaded: false,
      
      toggleSongs: function(e) {
        var albumEl = $(e.currentTarget).toggleClass('open'),
            artistEl = albumEl.closest('.artist').find('a'),
            album = albumEl.data('id'),
            artist = artistEl.data('id');
        
        this.ui.songs.toggleClass('collapsed');
        
        if (!this.loaded) {
          
          this.collection.filter = artist + ' ' + album;
          
          MPDisco.command('find', ['artist', artist, 'album', album]);
          
          this.loaded = true;
        }
      },
      
      select: function(e) {
        this.toggleSongs(e);
        
        MPDisco.vent.trigger('select:library', this);
        
        return false;
      },
      add: function(e) {
        var albumEl = $(e.currentTarget).toggleClass('open'),
            artistEl = albumEl.closest('.artist').find('a'),
            album = albumEl.data('id'),
            artist = artistEl.data('id');
            
        MPDisco.command('findadd', ['artist', artist, 'album', album]);
        
        return false;
      }
    });
    
    Library.LibraryArtistView = Marionette.CompositeView.extend({
      tagName: 'li',
      
      className: 'artist',
      
      template: '#artist_template',
      
      events: {
        'click .name': 'select',
        'dblclick .name': 'add'
      },
      
      ui: {
        albums: '.albums',
        name: '.name'
      },
      
      initialize: function() {
        this.collection = new Library.AlbumCollection; 
      },
      
      itemView: Library.LibraryAlbumView,
      itemViewContainer: '.tree',
      
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
      },
      
      select: function(e) {
        this.toggleAlbums(e);
        
        MPDisco.vent.trigger('select:library', this);
        
        return false;
      },
      add: function(e) {
        var artistEl = $(e.currentTarget).toggleClass('open'),
            artist = artistEl.data('id');
            
        MPDisco.command('findadd', ['artist', artist]);
        
        return false;
      }
    });
    
    Library.LibraryView = Marionette.CompositeView.extend({
      template: '#library_template',
      
      className: 'library',
      
      collection: new Library.ArtistCollection,
      
      itemView: Library.LibraryArtistView,
      itemViewContainer: '.tree',
      
      initialize: function() {
        MPDisco.command('list', 'artist');
        
        this.listenTo(MPDisco.vent, 'select:library', this.select);
      },
      
      select: function(view) {
        this.$('li').removeClass('selected');
        
        view.$el.addClass('selected');
      }
    });
  });
  
  return Library;
});