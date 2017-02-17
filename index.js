const { ApolloClient, createBatchingNetworkInterface } = require('apollo-client');
const gql = require('graphql-tag');
const _ = require('lodash');

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

  client = new ApolloClient({ networkInterface, queryDeduplication: true });

  next();
};

module.exports.execute = () => ({
  query: client.query,
  queryBuilder: gql,
});
