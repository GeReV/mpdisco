module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      src: ['public/js', 'public/css']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      //gruntfile: {
      //  src: 'Gruntfile.js'
      //},
      //client: {
      //  src: ['js/*.js']
      //},
      //server: {
      //  src: ['server/**/*.js']
      //},
      //index: {
      //  src: 'index.js'
      //}
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
    autoprefixer: {
      'default': {
        options: {
          // Target-specific options go here.
        },
        src: 'public/css/mpdisco.css',
        dest: 'public/css/mpdisco.css'
      }
    },
    browserify: {
      dist: {
        files: {
          'public/js/mpdisco.js': ['js/app.jsx']
        },
        options: {
          transform: ['reactify']
        }
      }
    },
    bower: {
      install: {
        options: {
          targetDir: './js/vendor',
          cleanBowerDir: true
        }
      }
    },
    watch: {
      src: {
        files: ['js/**/*.js'],
        tasks: ['uglify:debug']
      },
      sass: {
        files: ['css/**/*.scss'],
        tasks: ['sass:debug', 'autoprefixer:default']
      },
      handlebars: {
        files: ['views/templates/**/*.hbs'],
        tasks: ['handlebars']
      }
    }
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');


  // Default task(s).
  grunt.registerTask('default', ['jshint', 'clean', 'bower', 'browserify', 'sass:release', 'autoprefixer:default']);
  grunt.registerTask('debug',   ['jshint', 'clean', 'bower', 'browserify', 'sass:debug', 'autoprefixer:default']);

};