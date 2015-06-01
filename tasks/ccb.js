'use string';

var JiraApi = require('jira').JiraApi;
var q = require('q');
var util = require('util');

module.exports = function(grunt){

  grunt.registerMultiTask('jira', 'JIRA Grunt Task', function(){

    var jira;
    var done = this.async();
    var options = this.options({});

    grunt.verbose.writeflags(options);

    var mainConfig = {
      protocol: options.jira.protocol || 'https',
      host: options.jira.host || options.jira.api_url,
      port: options.jira.port || 443,
      user: options.jira.username || options.jira.user,
      password: options.jira.password || options.jira.pass,
      version: options.jira.version || '2',
      verbose: options.jira.verbose || true,
      strictSSL: options.jira.strictSSL || false
    };

    grunt.verbose.writeln('Config', mainConfig);

    jira = new JiraApi(
      mainConfig.protocol,
      mainConfig.host,
      mainConfig.port,
      mainConfig.user,
      mainConfig.password,
      mainConfig.version,
      mainConfig.verbose,
      mainConfig.strictSSL
    );

    var createTicket = function() {
      grunt.verbose.writeln("Creating CCB");

      var deferred = q.defer();
      var issueOptions = {
        fields: {
          project: {
            id: options.jira.project_id
          },
          summary: util.format('Deploying %s %s to production', options.project.name, options.build_number),
          issuetype: {
            id: options.jira.ccb_issue_type
          },
          customfield_11502: grunt.template.today("isoDateTime"),
          customfield_11505: 'Commit log - ' + options.jira.project_id
        }
      };

      grunt.verbose.writeln('issueOptions', issueOptions);

      jira.addNewIssue(issueOptions, function(err, response){
        if (err) {
          grunt.verbose.writeln("err", err);
          deferred.reject(err);
        } else {
          grunt.verbose.writeln("response", response);
          deferred.resolve(response);
        }
      });

      return deferred.promise;
    };

    var updateCcbToDoneAndUploadManfest = function(args){
      grunt.verbose.writeln("Upload attachment");
      var deferred = q.defer();
      grunt.verbose.writeln(JSON.stringify(args));

      var issueOptions = {
        fields: {
          issue: {
            key: args.key
          }
        },
        file: options.manifest
      };
      jira.updateIssue(issueOptions, function(err, response) {
        if (err){
          grunt.verbose.writeln("error", err);
          deferred.reject(err);
        } else {
          grunt.verbose.writeln("response", response);
          deferred.resolve(response);
        }
      });

      return deferred.promise;
    };

    createTicket().then(function(response){
      return updateCcbToDoneAndUploadManfest(response);
    }).catch(function(error){
      grunt.fatal(error);
    }).done(function(){
      grunt.verbose.writeln('Done.');
      return done();
    });

  });
};
