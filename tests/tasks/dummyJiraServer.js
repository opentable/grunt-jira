var https = require("https");
var fs = require("fs");
var server = {};
var options = {};
var port = 9000;

try {
    options = {
      key: fs.readFileSync('tests/keys/key.pem'),
      cert: fs.readFileSync('tests/keys/key-cert.pem')
    };

  fs.mkdirSync("tests/data/actual");
}
catch (err) {}

var createCbbRequest = fs.openSync('tests/data/actual/ccb-request.json', 'w');
var doneTransitionRequest = fs.openSync('tests/data/actual/done-transition-request.json', 'w');

module.exports = function(grunt){
    grunt.registerTask('start-jira-server', function(){
        server = https.createServer(options, function(request, response) {
            console.log(request);
            if (request.method != 'POST'){
                throw new Error("This dummy server only responds to POST requests");
            }

            var body = '';
            request.on('data', function (data) {
                body += data;
            });

            request.on('end', function () {

                var bodyJson = JSON.parse(body);

                if (request.url === '/issue/') //create ccb
                {
                    fs.writeSync(createCbbRequest, JSON.stringify({ headers: request.headers, url: request.url, body: bodyJson  }));
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.write('{ "id": 1234 }');
                }
                else if (bodyJson.transition.id === 11){ //done

                    fs.writeSync(doneTransitionRequest, JSON.stringify({ headers: request.headers, url: request.url, body: bodyJson }));
                    response.writeHead(200, {"Content-Type": "application/json"});

                }

                response.end();
            });
        }).listen(port);
    });
};
