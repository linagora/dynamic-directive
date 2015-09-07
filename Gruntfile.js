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
      configFile: './test/config/karma.conf.js',
      browsers: ['PhantomJS']
    }
  }
});
grunt.loadNpmTasks('grunt-karma');
grunt.registerTask("default", ["babel"]);
grunt.registerTask('test-frontend', 'Run the frontend tests', ['karma:unit']);
};
