const http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    {testsScriptsDir} = require('./paths');
let currentRequest;

console.log('Creating server');

http.createServer(function(request, response) {
    if (currentRequest) {
        currentRequest.abort();
        console.log('Abort request');
    }

    console.log();
    console.log('Handling request');

    const respond = result => {
        console.log(`Respond with ${result}`);

        response.setHeader('Content-Type', 'text/html; charset=utf-8;');
        response.write(result);
        response.end();
    };

    const {pathname, query} = url.parse(request.url),
        segments = pathname.split('/'),
        paths = [],
        respondWithBody = body => respond(`<html><title>Tests</title><body>${body}</body></html>`);

    console.log(`URL ${request.url}`);

    if (!segments.some(segment => !!segment)) {
        console.log('Tests menu');

        fs.readdirSync(testsScriptsDir).forEach(path =>
            !fs.lstatSync(`${testsScriptsDir}/${path}`).isDirectory() && paths.push(path.split('.')[0]));

        respondWithBody(paths.map(path => `<div><a href="/pages/${path}">${path}</a></div>`).join(''));
    } else if (segments[1] == 'pages') {
        const page = segments[2];
        console.log(`Page ${page}`);

        currentRequest = http.request({
            host: '127.0.0.1',
            port: '8080',
            path: '/'
        }, response => {
            let result = '';

            response.on('data', chunk => (result += chunk));
            response.on('end', () => respond(result.split('{script}').join(page)));
        });

        currentRequest.end();
    } else {
        respondWithBody('Not found');
    }

}).listen(8081);

process.on('uncaughtException', error => console.log(`Error ${error}`));
