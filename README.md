# superagent-retry-header-delay

  Extends the node version of [superagent][https://github.com/visionmedia/superagent]'s `Request`, adds a `.retry` method to add retrying logic to the request. Calling this will retry the request however many additional times you'd like with 1 second in between retries or after a specified amount of time, in seconds, included in the HTTP header. You can specify which header to use to read the amount of time.

  It will retry on any 500 error and on those on the list of 100s and 400s response codes optionally supplied.

  v2 relies on superagent's internal retry mechanism for retrying, added on superagent 3.5. Use v1 otherwise.

  This library is based on [superagent-retry](https://github.com/segmentio/superagent-retry) and extends [superagent](https://github.com/visionmedia/superagent)

## Usage

```javascript
// With superagent
const superagent = require('superagent');
require('superagent-retry-delay')(superagent);

superagent
  .get('https://segment.io')
  .retry(2, [429], 'Retry-After') // retry twice for error 429 before responding, wait the number of seconds specified in Retry-After header between failures
  .end(onresponse);

superagent
  .get('https://segment.io')
  .retry(2, [429]) // retry twice for error 429 before responding, wait 1 second between failures
  .end(onresponse);

superagent
  .get('https://segment.io')
  .retry(2) // retry twice for any HTTP 500 error before responding, wait 1 second between failures
  .end(onresponse);

function onresponse (err, res) {
  console.log(res.status, res.headers);
  console.log(res.body);
}

```

```javascript
// With supertest
const superagent = require('superagent');
require('superagent-retry-delay')(superagent);

const supertest = require('supertest');
```

## Mocha users

  Ensure your mocha timeout for tests (default is 10000ms) is long enough to accommodate for all possible retries, including the specified delays.

## Retrying Cases

  Currently the retrying logic checks only for the codes 100s and 400s errors specified in the list.


## License

(The MIT License)

Copyright (c) 2019 Antonio Goulao &lt;http://github.com/antoniogoulao&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
