### URL Resolver

In one terminal run:
```sh
$ node server.js
```

In another run:
```sh
$ phantomjs phantomjs-server.js
```

You are good to go. A third terminal:

```sh
$ curl --request GET http://localhost:9000?url=http://bit.ly/1lXQols
{
    "result":"success",
    "url":"http://mashable.com/2014/07/03/twitter-world-cup-shootouts/?utm_cid=mash-com-Tw-main-link",
    "redirects":4
}
```

