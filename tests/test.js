/* eslint-env mocha */

const express = require('express')

const agent = require('superagent')
require('../')(agent)

require('should')
const http = require('http')

http.globalAgent.maxSockets = 10000

describe('superagent-retry-header-delay', function () {
  describe('not-errors', function () {
    let requests = 0
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        requests++
        res.send('hello!')
      })

      server = app.listen(port, done)
    })

    it('should not retry on success', function (done) {
      agent
        .get('http://localhost:' + port)
        .retry(5)
        .end(function (err, res) {
          res.text.should.eql('hello!')
          requests.should.eql(1)

          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })

  describe('429 handled error without header', function () {
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        res.sendStatus(429)
      })

      server = app.listen(port, done)
    })

    it('should retry on 429 error', function (done) {
      agent
        .get('http://localhost:' + port)
        .retry(5, [429])
        .end(function (err, res) {
          res.status.should.eql(429)
          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })

  describe('429 handled error with Retry-After header', function () {
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        res.append('Retry-After', 5)
        res.sendStatus(429)
      })

      server = app.listen(port, done)
    })

    it('should retry on 429 error', function (done) {
      agent
        .get('http://localhost:' + port)
        .retry(5, [429])
        .end(function (err, res) {
          res.status.should.eql(429)
          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })

  describe('429 handled error with X-Rate-Limit-Retry-After-Seconds header', function () {
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        res.append('X-Rate-Limit-Retry-After-Seconds', 5)
        res.sendStatus(429)
      })

      server = app.listen(port, done)
    })

    it('should retry on 429 error', function (done) {
      agent
        .get('http://localhost:' + port)
        .retry(5, [429])
        .end(function (err, res) {
          res.status.should.eql(429)
          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })

  describe('errors', function () {
    let requests = 0
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        requests++
        if (requests > 4) {
          res.send('hello!')
        } else {
          res.sendStatus(503)
        }
      })

      server = app.listen(port, done)
    })

    it('should retry on errors', function (done) {
      agent
        .get('http://localhost:' + port)
        .end(function (err, res) {
          res.status.should.eql(503)

          // appease eslint, do nothing with error to allow it to bubble up
          if (err) { }
        })

      agent
        .get('http://localhost:' + port)
        .retry(5)
        .end(function (err, res) {
          res.text.should.eql('hello!')
          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })

  describe('500 errors', function () {
    let requests = 0
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        requests++
        if (requests > 4) {
          res.send('hello!')
        } else {
          res.sendStatus(500)
        }
      })

      server = app.listen(port, done)
    })

    it('should retry on errors', function (done) {
      agent
        .get('http://localhost:' + port)
        .end(function (err, res) {
          res.status.should.eql(500)

          // appease eslint, do nothing with error to allow it to bubble up
          if (err) { }
        })

      agent
        .get('http://localhost:' + port)
        .retry(5)
        .end(function (err, res) {
          res.text.should.eql('hello!')
          requests.should.eql(5)
          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })

  describe('404 errors', function () {
    let requests = 0
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        requests++
        if (requests > 4) {
          res.send('hello!')
        } else {
          res.sendStatus(404)
        }
      })

      server = app.listen(port, done)
    })

    it('should retry on errors', function (done) {
      agent
        .get('http://localhost:' + port)
        .end(function (err, res) {
          res.status.should.eql(404)

          // appease eslint, do nothing with error to allow it to bubble up
          if (err) { }
        })

      agent
        .get('http://localhost:' + port)
        .retry(5, [404])
        .end(function (err, res) {
          res.text.should.eql('hello!')
          requests.should.eql(5)
          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })

  describe('101 informational', function () {
    let requests = 0
    const port = 10410
    const app = express()
    let server

    before(function (done) {
      app.get('/', function (req, res, next) {
        requests++
        if (requests > 4) {
          res.send('hello!')
        } else {
          res.sendStatus(101)
        }
      })

      server = app.listen(port, done)
    })

    it('should retry on errors', function (done) {
      agent
        .get('http://localhost:' + port)
        .end(function (err, res) {
          res.status.should.eql(101)

          // appease eslint, do nothing with error to allow it to bubble up
          if (err) { }
        })

      agent
        .get('http://localhost:' + port)
        .retry(5, [101])
        .end(function (err, res) {
          res.text.should.eql('hello!')
          requests.should.eql(5)
          done(err)
        })
    })

    after(function (done) { server.close(done) })
  })
})
