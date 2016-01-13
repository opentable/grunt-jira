const ccb = require('../lib/ccb');

module.exports = function(grunt) {
  grunt.registerMultiTask('jira', 'JIRA Grunt Task', function() {
    const done = this.async();
    const options = this.options({});

    grunt.verbose.writeflags(options);

    options.logger = grunt.verbose.writeln;

    ccb(options)
      .catch(function(error) {
        grunt.verbose.writeln('>> Error: ' , JSON.stringify(error));
        done(error);
      })
      .done(function() {
        grunt.verbose.writeln('Done.');
        done();
      });
  });
};
