'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'dist/dynamic-directive.js': 'src/dynamic-directive.js'
        }
      }
    },
    karma: {
      unit: {
        configFile: './test/config/karma.dev.conf.js',
        browsers: ['PhantomJS']
      },
      build: {
        configFile: './test/config/karma.conf.js',
        browsers: ['PhantomJS']
      }
    },
    uglify: {
      dist: {
        options: {
          sourceMap: true,
          screwIE8: true
        },
        files: {
          'dist/dynamic-directive.min.js': ['dist/dynamic-directive.js']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= jshint.all.src %>']
      }
    },
    jscs: {
      lint: {
        options: {
          config: '.jscsrc',
          esnext: true
        },
        src: ['<%= jshint.all.src %>']
      },
      fix: {
        options: {
          config: '.jscsrc',
          esnext: true,
          fix: true
        },
        src: ['<%= jshint.all.src %>']
      }
    },
    watch: {
      src: {
        files: ['src/**/*.js'],
        tasks: ['linters', 'babel']
      },
      test: {
        files: 'test/**/*.js',
        tasks: ['test-frontend']
      }
    },
    release: {
      options: {
        beforeBump: 'grunt default',
        additionalFiles: ['bower.json']
      }
    }
  });
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lint-pattern');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('default', ['linters', 'babel:dist', 'uglify:dist', 'test-frontend-min']);
  grunt.registerTask('test', ['default']);
  grunt.registerTask('test-frontend-min', 'Run the frontend tests', ['karma:build']);
  grunt.registerTask('test-frontend', 'Run the frontend tests', ['babel:dist', 'uglify:dist', 'karma:unit']);
  grunt.registerTask('linters', ['lint_pattern', 'jshint', 'jscs:lint']);
  grunt.registerTask('fixstyle', ['jscs:fix']);
};
