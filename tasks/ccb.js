'use string';

var jiraApi = require('jira-api');
var q = require('q');
var util = require('util');

module.exports = function(grunt){

  grunt.registerMultiTask('ccb', 'JIRA Grunt Task', function(){


    var done = this.async();
    var options = this.options({});

    grunt.verbose.writeflags(options);

    var createTicket = function() {
      grunt.verbose.writeln("Creating CCB");

      var deferred = q.defer();
      var jiraOptions = {
        config: {
          "username": options.jira.username || options.jira.user,
          "password": options.jira.password || options.jira.pass,
          "host": options.jira.host || options.jira.api_url
        },
        data: {
          fields: {
            project: {
              name: options.jira.project_id,
              key: options.jira.project_id
            },
            summary: util.format('Deploying %s %s to production', options.project.name, options.build_number),
            issueType: {
              id: options.jira.ccb_issue_type
            },
            customfield_11502: grunt.template.today("isoDateTime"),
            customfield_11505: 'Commit log - ' + options.jira.project_id
          }
        }
      };

      grunt.verbose.writeln(JSON.stringify(jiraOptions));

      jiraApi.issue.post(jiraOptions, function(response) {
          if (response && response.id && response.key) {
            grunt.verbose.writeln("response", response);
            deferred.resolve(response);
          } else {
            grunt.verbose.writeln("error", response);
            deferred.reject(response);
          }
      });
      return deferred.promise;
    };

    var updateCcbToDoneAndUploadManfest = function(args){
      grunt.verbose.writeln("Upload attachment");
      var deferred = q.defer();
      grunt.verbose.writeln(JSON.stringify(args));

      var jiraOptions = {
        config: {
          "username": options.jira.user,
          "passowrd": options.jira.password,
          "host": "example.com/jira/"
        },
        data: {
          fields: {
            issue: {
              key: args.key
            }
          },
          file: options.manifest
        }
      };

      jiraApi.issue.post(jiraOptions, function(err, response) {
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
