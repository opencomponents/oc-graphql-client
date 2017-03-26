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
    } else if (result.statusCode !== 200) {
      return reject(new Error(http.STATUS_CODES[result.statusCode]));
    }

    return resolve(body);
  })),
});
