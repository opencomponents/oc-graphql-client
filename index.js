const _ = require('lodash');
const http = require('http');
const gql = require('graphql-tag');
const { ApolloClient, createBatchingNetworkInterface } = require('apollo-client');

// Pollyfill: https://github.com/apollographql/apollo-client/issues/1225
require('isomorphic-fetch'); // eslint-disable-line global-require

let client;

const mergeHeaderArguments = (options, headers) =>
  _.merge(options, { variables: { __headers: headers } });

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
        req.options.headers = _.extend({ 'User-Agent': 'oc' }, req.request.variables.__headers);
      }
      done();
    },
  }]);

  client = new ApolloClient({ networkInterface, queryDeduplication: true });

  next();
};

module.exports.execute = () => ({
  //See: https://github.com/apollographql/apollo-client/issues/1419
  query: (query, variables, headers, timeout) => client.networkInterface.query({
      query: gql(query),
      variables: mergeHeaderArguments(variables, headers)
    })
});
