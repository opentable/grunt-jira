const JiraApi = require('jira').JiraApi;
const q = require('q');
const util = require('util');
const fs = require('fs');

const readFile = q.denodeify(fs.readFile);

module.exports = function ccb(args) {
  const logger = args.logger || console.log.bind(console);

  logger('Options::', args);

  const config = {
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

  const jira = new JiraApi(
    config.protocol,
    config.host,
    config.port,
    config.user,
    config.password,
    config.version,
    config.verbose,
    config.strictSSL
  );

  logger('Creating CCB');

  function addNewIssue(manifest) {
    const issueOptions = {
      fields: {
        project: {
          id: args.jira.project_id
        },
        summary: util.format('Deploying %s %s to production', args.project.name, args.build_number),
        customfield_11502: new Date().toISOString(),
        customfield_11505: manifest,
        issuetype: {
          id: config.issuetype_id
        }
      }
    };

    logger('issueOptions', JSON.stringify(issueOptions));

    return q.promise(function(resolve, reject) {
      jira.addNewIssue(issueOptions, function(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  return readFile(args.manifest, 'utf-8')
    .then(function(manifest) {
      return addNewIssue(manifest);
    })
    .then(function(result) {
      logger('Issue: ', result);
      return result;
    })
    .catch(function(err) {
      const errorObj =
        err instanceof Error ?
          err :
          new Error(JSON.stringify(err));

      logger('err', errorObj.message);
      throw errorObj;
    });
};
