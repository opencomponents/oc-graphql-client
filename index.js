const fetch = require('isomorphic-fetch');
const _ = require('lodash');

let client;

const createQuery = (query, variables) => {
  const body = {
    query,
    variables,
    operationName: null,
  };

  return JSON.stringify(body);
};

const checkResponseStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
};

const parseResponse = response => response.json();

module.exports.register = (opts, dependencies, next) => { // eslint-disable-line consistent-return
  if (!opts.serverUrl) {
    return next(new Error('The serverUrl parameter is invalid'));
  }

  client = (options, headers) => fetch(opts.serverUrl, {
    method: 'POST',
    headers: _.extend(
      {
        'Content-Type': 'application/json',
        'User-Agent': 'oc',
      }, headers),

    body: createQuery(options.query, options.variables),
  }).then(checkResponseStatus)
    .then(parseResponse);

  next();
};

module.exports.execute = () => ({
  query: (options, headers) => client(options, headers),
});
