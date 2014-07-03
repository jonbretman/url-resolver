var http = require('http');
var parseUrl = require('url').parse;

// simple cache - fine for prototype but should
// obviously be something a little bit more robust
var cache = {};

// standard JSON string response for errors
var errorResponse = JSON.stringify({
    result: 'error',
    url: null,
    redirects: null
});

// amount of time to wait for the PhantomJS
// service to return a response.
var PHANTOM_JS_TIMEOUT = 5000;

/**
 * Resolves the url parameter from the request and
 * makes sure it starts with a protocol.
 * @param {http.ClientRequest} request
 * @returns {String|Null}
 */
var resolveUrlParameter = function (request) {

    var url = parseUrl(request.url, true).query.url;

    if (!url) {
        return null;
    }

    if (url.substring(0, 4) !== 'http') {

        if (url.substring(0, 2) === '//') {
            return 'http:' + url;
        }

        return 'http://' + url;
    }

    return url;
};

/**
 * Resolves URL using the PhantomJS service.
 * @param {String} url
 * @param {Function} fn
 */
var resolveUrlFromPhantomJS = function (url, fn) {

    var timeoutId = null;

    var phantomjsRequest = http.get('http://localhost:9876?url=' + url, function (responseStream) {

        var data = '';

        responseStream.on('data', function (chunk) {
            data += chunk;
        });

        responseStream.on('end', function () {
            clearTimeout(timeoutId);
            console.log('successfully resolved url from phantomjs', data);
            fn(null, data);
        });

    });

    phantomjsRequest.on('error', function (e) {
        console.log('error resolving url from phantomjs', e);
        fn(true, null);
    });

    timeoutId = setTimeout(function () {
        phantomjsRequest.end();
        console.log('timeout resolving url from phantomjs');
        fn(true, null);
    }, PHANTOM_JS_TIMEOUT);
};

/**
 * Handles a request.
 * @param {http.ClientRequest} request
 * @param {http.ClientResponse} response
 */
var handleRequest = function (request, response) {

    var url = resolveUrlParameter(request);

    response.writeHead(200, {'Content-Type': 'application/json'});

    if (!url) {
        console.log('invalid url parameter');
        response.end(errorResponse);
        return;
    }

    if (cache[url]) {
        console.log('cache hit', url, cache[url]);
        response.end(cache[url]);
        return;
    }

    resolveUrlFromPhantomJS(url, function (err, jsonResponse) {

        if (err) {
            response.end(errorResponse);
            return;
        }

        cache[url] = jsonResponse;
        response.end(jsonResponse);
    });
};

http.createServer(handleRequest).listen(9877, 'localhost');