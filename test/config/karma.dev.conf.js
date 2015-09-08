'use strict';

module.exports = function(config) {
  config.set({
    basePath: '../../',
    files: [
      'frontend/components/jquery/dist/jquery.js',
      'frontend/components/angular/angular.js',
      'frontend/components/angular-mocks/angular-mocks.js',
      'frontend/components/chai/chai.js',
      'dist/dynamic-directive.js',
      'test/**/*.js'
    ],
    frameworks: ['mocha'],
    colors: true,
    singleRun: true,
    browsers: ['PhantomJS'],
    reporters: ['spec']
  });
};
