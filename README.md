### URL Resolver

Proof of concept for a URL resolver than will follow all redirects including those done via JavaScript using `window.location`.

To get started run:
```sh
$ node server.js
```

In another terminal window run:
```sh
$ phantomjs phantomjs-server.js
```

In a third terminal test it out:

```sh
$ curl --request GET http://localhost:9000?url=http://bit.ly/1lXQols
{
    "result": "success",
    "url": "http://mashable.com/2014/07/03/twitter-world-cup-shootouts/?utm_cid=mash-com-Tw-main-link",
    "redirects": 4
}
```

### Thoughts
* Start PhantomJS process from inside server.js
* Maybe run a few PhantomJS processes and round-robin them. Each one can handle 10 concurrent requests.
* Proper cache in server.js with some TTL logic etc..

