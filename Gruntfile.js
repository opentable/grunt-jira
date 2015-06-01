module.exports = function(grunt) {
  'use strict';

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({

    jshint: {
        all: [
          'Gruntfile.js',
          'tasks/*.js'
        ],
        options: {
            jshintrc: '.jshintrc'
        }
    },
    mochaTest:{
      options: {
        reporter: 'spec'
      },
      tests:{
        src: ['tests/ccb-tests.js']
      }
    },
    'jira': {
      test: {
        options: {
          jira: {
            protocol: 'https',
            host: "localhost",
            port: 9000,
            username: "usertest",
            password: "passwordtest",
            verbose: true,
            version: 2,
            project_id: "4321",
            ccb_issue_type: 20,
            ccb_done_state: 11
          },
          project: {
            name: "projectname",
            custom_text: "some text"
          },
          manifest: "tests/data/manifest.json",
          build_number: "grunt-ccb_1234"
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('test', ['jshint', 'start-jira-server', 'jira:test', 'mochaTest']);
  grunt.registerTask('default', ['test']);
  grunt.loadTasks('tasks');
  grunt.loadTasks('tests/tasks');
};
