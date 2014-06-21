module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      src: ['public/js', 'public/css']
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      client: {
        src: ['js/**/*.js']
      },
      server: {
        src: ['server/**/*.js']
      },
      index: {
        src: 'index.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      vendor: {
        options: {
          compress: {
            unused: false
          },
          mangle: {
            except: ['$', '_', 'Backbone', 'jQuery', 'Handlebars']
          }
        },
        files: [{
          expand: true,
          cwd: 'js/vendor',
          src: '*.js',
          dest: 'public/js/vendor'
        }]
      },
      release: {
        files: [{
          expand: true,
          cwd: 'js',
          src: '*.js',
          dest: 'public/js'
        }]
      },
      debug: {
        options: {
          compress: false,
          mangle: false,
          beautify: true
        },
        files: [{
          expand: true,
          cwd: 'js',
          src: '**/*.js',
          dest: 'public/js'
        }]
      }
    },
    sass: {
      release: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/css/mpdisco.css': 'css/mpdisco.scss'
        }
      },
      debug: {
        files: {
          'public/css/mpdisco.css': 'css/mpdisco.scss'
        }
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: "JST"
        },
        files: {
          'public/js/templates.js': ['views/templates/**/*.hbs']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  // Default task(s).
  grunt.registerTask('default', [/*'jshint',*/ 'clean', 'handlebars', 'uglify:vendor', 'uglify:release', 'sass:release']);
  grunt.registerTask('debug', [/*'jshint',*/ 'clean', 'handlebars', 'uglify:debug', 'sass:debug']);

};