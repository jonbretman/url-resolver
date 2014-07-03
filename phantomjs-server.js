var webpage = require('webpage');
var webserver = require('webserver');
var server = webserver.create();
var URL_REGEX = /\?url=(.*?)$/;

var resolveUrl = function (url, fn, redirects) {

    console.log('resolve url', url);
    var page = webpage.create();
    var redirected = false;

    page.onNavigationRequested = function (redirectUrl, type, willNavigate, main) {

        if (main && type === 'Other' && url !== redirectUrl) {
            console.log('handling redirect from', url, 'to', redirectUrl);
            page.close();
            redirected = true;
            resolveUrl(redirectUrl, fn, redirects ? redirects + 1 : 1);
        }

    };

    page.open(url, function (status) {

        if (status !== 'success') {
            console.log('error loading page', url);
            fn(true, null);
            return;
        }

        setTimeout(function () {

            if (redirected) {
                return;
            }

            fn(null, url, redirects || 0);

        }, 50);

    });

};

var handleRequest = function (request, response) {

    var url = decodeURIComponent(request.url);
    var match = url.match(URL_REGEX);

    response.setHeader('Content-Type', 'application/json');
    response.statusCode = 200;

    if (!match || !match[1]) {
        console.log('invalid url parameter');
        response.write(JSON.stringify({
            result: 'error'
        }));
        response.close();
        return;
    }

    url = match[1];

    resolveUrl(url, function (err, result, redirects) {

        if (err) {
            response.write(JSON.stringify({
                result: 'error'
            }));
        }
        else {
            console.log('successfully resolved url from', url, 'to', result);
            response.write(JSON.stringify({
                result: 'success',
                url: result,
                redirects: redirects
            }));
        }

        response.close();

    });

};

server.listen(8989, handleRequest);
