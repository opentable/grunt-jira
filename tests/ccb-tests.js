var ccb = require('../lib/ccb');
var should = require('should');
var fs = require('fs');
var assert = require('assert');
var JiraApi = require('jira').JiraApi;

describe('when executing ccb', function() {
  // README: Add your jira username and password to grunt test as environment variables.
  // e.g. JIRA_USERNAME=myusername JIRA_PASSWORD=mypassword grunt test
  it('has valid jira credentials env variables', function() {
    assert.equal(
      typeof process.env.JIRA_USERNAME,
      'string',
      'must provide a jira username'
    );
    assert.equal(
      typeof process.env.JIRA_PASSWORD,
      'string',
      'must provide a jira password'
    );
  });

  describe('with valid jira credentials', function() {
    this.timeout(10000);

    var result;
    var jiraConfig = {
      protocol: 'https',
      host: 'opentable.atlassian.net',
      port: 443,
      username: process.env.JIRA_USERNAME,
      password: process.env.JIRA_PASSWORD,
      verbose: true,
      version: '2',
      // README: this project id belongs to the integration test project
      // https://opentable.atlassian.net/projects/INTT/issues/
      project_id: '19200',
      ccb_issue_type: '1',
      ccb_done_state: '11',
      proxy: ''
    };

    var jira = new JiraApi(
      jiraConfig.protocol,
      jiraConfig.host,
      jiraConfig.port,
      jiraConfig.user,
      jiraConfig.password,
      jiraConfig.version,
      jiraConfig.verbose,
      jiraConfig.strictSSL
    );

    before(function(done) {
      ccb({
        jira: jiraConfig,
        project: {
          name: 'Search API v2 (node)',
          custom_text: 'Search API v2 Manifest Step',
          description: 'Search API v2 Manifest Step'
        },
        manifest: process.cwd() + '/tests/data/manifest.json',
        build_number: 'v0.0.350'
      })
      .then(function(res) {
        result = JSON.parse(res);
        done();
      })
      .catch(function(err) {
        console.log('\n README: If you see an authentication error, you may need to add your credentials as environment variables. \n');
        done(err);
      })
      .done();
    });

    it('responds with a valid issue', function() {
      assert.ok(result instanceof Array);
      assert.equal(result[0].filename, 'manifest.json');
    });
  });
});
