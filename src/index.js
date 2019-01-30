/**
 * Add to the request prototype.
 */

module.exports = function (superagent) {
  if (superagent) {
    const Request = superagent.Request

    Request.prototype.oldRetry = Request.prototype.retry
    Request.prototype.retry = retry
    Request.prototype.callback = callback

    return superagent
  }
}

/**
 * Works out whether we should retry, based on the number of retries, on any passed
 * errors and response and compared against a list of allowed error statuses.
 *
 * @param {Response} res
 * @param {Error} err
 * @param {Number} allowedStatuses
 */
function shouldRetry (err, res, allowedStatuses) {
  const ERROR_CODES = [
    'ECONNRESET',
    'ETIMEDOUT',
    'EADDRINFO',
    'ESOCKETTIMEDOUT',
    'ENOTFOUND'
  ]

  if (err && err.code && ~ERROR_CODES.indexOf(err.code)) {
    return true
  }

  if (res && res.status) {
    const status = res.status

    if (status >= 500) {
      return true
    }

    if ((status >= 400 || status < 200) && allowedStatuses.indexOf(status) !== -1) {
      return true
    }
  }

  // Superagent timeout
  if (err && 'timeout' in err && err.code === 'ECONNABORTED') {
    return true
  }

  return !!(err && 'crossDomain' in err)
}

/**
 * Override Request callback to set a timeout on the call to retry.
 *
 * This overrides crucial behaviour: it will retry on ANY error (eg 429...) due to shouldRetry having
 * different behaviour.
 *
 * @param err
 * @param res
 * @return {Object}
 */
function callback (err, res) {
  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res, this._allowedStatuses)) {
    let req = this
    let timeout = this._responseHeader ? res.xhr.getResponseHeader(this._responseHeader) * 1000 : 1000
    return setTimeout(function () {
      return req._retry()
    }, timeout)
  }

  let fn = this._callback
  this.clearTimeout()

  if (err && this._maxRetries) err.retries = this._retries - 1

  fn(err, res)
}

/**
 * Override Request retry to also set allowed statuses.
 * Receives the number of retries and the HTTP codes on which retries should be
 * performed. Optionally receives the response header where the waiting time is
 * passed in seconds
 *
 * @param {Number} retries - number of retries to perform
 * @param {Number[]} allowedStatuses - array with HTTP codes
 * @param {String} responseHeader - waiting time between retries in seconds
 * @return {retry}
 */
function retry (retries, allowedStatuses, responseHeader) {
  if (arguments.length === 0 || retries === true) {
    retries = 1
  }

  if (retries <= 0) {
    retries = 0
  }

  this._maxRetries = retries
  this._responseHeader = responseHeader || null
  this._retries = 0
  this._allowedStatuses = allowedStatuses || []

  return this
}
