const http = require('http');
const request = require('request');
const _ = require('lodash');

let settings;

module.exports.register = (opts, dependencies, next) => {
  if (!opts.serverUrl) {
    return next(new Error('The serverUrl parameter is invalid'));
  }

  settings = opts;
  return next();
};

module.exports.execute = () => ({
  query: (options, headers, timeout) => new Promise((resolve, reject) => request({
    body: {
      query: options.query,
      variables: options.variables,
      operationName: null,
    },
    headers: _.extend({ 'User-Agent': 'oc' }, headers),
    json: true,
    method: 'POST',
    timeout,
    url: settings.serverUrl,
  }, (err, result, body) => {
    if (err) {
      return reject(new Error(err));
    }

    if (typeof body !== 'object' || body === null) {
      return reject({
        errors: [{
          message: 'Invalid response from graphql server.',
          http: {
            status: http.STATUS_CODES[result.statusCode],
            code: result.statusCode,
            body,
          },
        }],
      });
    }

    // http://facebook.github.io/graphql/October2016/#sec-Errors
    if ('errors' in body || !('data' in body)) {
      return reject(body);
    }

    return resolve(body);
  })),
});
