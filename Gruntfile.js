module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      src: ['public/js', 'public/mpdisco.css']
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
          mangle: false
        },
        files: [{
          cwd: 'js',
          src: '**/*.js',
          dest: 'public/js'
        }]
      }
    },
    sass: {
      release: {
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
  grunt.registerTask('default', [/*'jshint',*/ 'clean', 'uglify:vendor', 'uglify:release', 'sass:release']);
  grunt.registerTask('debug', [/*'jshint',*/ 'clean', 'uglify:debug', 'sass:debug']);

};