'use strict';

var JiraApi = require('jira').JiraApi;
var q = require('q');
var util = require('util');
var fs = require('fs');

module.exports = function ccb(args) {
  var logger = args.logger || console.log.bind(console);

  logger('Options::', args);

  var config = {
    protocol: args.jira.protocol || 'https',
    host: args.jira.host || args.jira.api_url,
    port: args.jira.port || 443,
    user: args.jira.username || args.jira.user,
    password: args.jira.password || args.jira.pass,
    version: args.jira.version || '2',
    verbose: args.jira.verbose || true,
    strictSSL: args.jira.strictSSL || false,
    description: args.project.description || '',
    environment: args.environment || 'production',
    issuetype_id: args.jira.ccb_issue_type || '3',
    logger: logger
  };

  logger('Config', config);

  var jira = new JiraApi(
    config.protocol,
    config.host,
    config.port,
    config.user,
    config.password,
    config.version,
    config.verbose,
    config.strictSSL
  );

  logger("Creating CCB");
  var deferred = q.defer();

  try {
    var manifest = fs.readFileSync(args.manifest, { encoding: 'utf8' });
  } catch (e) {
    deferred.reject(new Error('Unable to locate manifest file: ' + args.manifest));
    return deferred.promise;
  }

  var issueOptions = {
    fields: {
      project: {
        id: args.jira.project_id
      },
      description: manifest,
      summary: util.format('Deploying %s %s to production', args.project.name, args.build_number),
      issuetype: {
        id: config.issuetype_id
      }
    }
  };

  logger('issueOptions', JSON.stringify(issueOptions));

  jira.addNewIssue(issueOptions, function(err, response) {
    if (err) {
      var errorObj =
        err instanceof Error ?
          err :
          new Error(JSON.stringify(err));

      logger("err", errorObj.message);
      deferred.reject(errorObj);
    } else {
      logger("response", response);
      deferred.resolve(response);
    }
  });

  return deferred.promise;
};
