const { ApolloClient, createBatchingNetworkInterface } = require('apollo-client');
const gql = require('graphql-tag');
const _ = require('lodash');

// Pollyfill: https://github.com/apollographql/apollo-client/issues/1225
require('isomorphic-fetch'); // eslint-disable-line global-require

let client;

module.exports.register = (opts, dependencies, next) => { // eslint-disable-line consistent-return
  if (opts.batchInterval && !_.isInteger(opts.batchInterval)) {
    return next(new Error('The batchInterval parameter is invalid'));
  }

  if (!opts.serverUrl) {
    return next(new Error('The serverUrl parameter is invalid'));
  }

  const options = { uri: opts.serverUrl, batchInterval: opts.batchInterval || 10 };
  const networkInterface = createBatchingNetworkInterface(options);

  networkInterface.use([{
    applyMiddleware(req, done) {
      if (!req.options.headers) {
        // eslint-disable-next-line
        req.options.headers = req.request.variables.__headers;
      }
      done();
    },
  }]);

  client = new ApolloClient({ networkInterface, queryDeduplication: true });

  next();
};

module.exports.execute = () => ({
  query: (query, headers) => client.query({ query, variables: { __headers: headers } }),
  queryBuilder: gql,
});
