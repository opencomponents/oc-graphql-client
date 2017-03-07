const { expect } = require('chai');
const injectr = require('injectr');
const sinon = require('sinon');

describe('OpenTable OC registry :: plugins :: graphql-plugin ', () => {
  // Mocking constructors is messy.
  const queryMock = sinon.stub();
  const apollo = sinon.stub({ ApolloClient: () => { } }, 'ApolloClient').returns({
    query: queryMock,
  });

  const mockCreateBatchingNetworkInterface = sinon
    .stub()
    .returns({
      use: () => { }
    });

  const clientMock = {
    createBatchingNetworkInterface: mockCreateBatchingNetworkInterface,
    ApolloClient: apollo
  };

  const plugin = injectr('../index.js', {
    'apollo-client': clientMock
  });

  describe('when calling register with an invalid batchInterval', () => {
    let error;
    beforeEach((done) => {
      plugin.register({ batchInterval: '10', serverUrl: 'http://graphql' }, {}, (err) => {
        error = err;
        done();
      });
    });

    it('should return an error saying batchInterval is invalid', () => {
      expect(error.toString()).to.contain('The batchInterval parameter is invalid');
    });
  });

  describe('when calling register with an valid batchInterval', () => {
    let error;
    beforeEach((done) => {
      plugin.register({ batchInterval: 25, serverUrl: 'http://graphql' }, {}, (err) => {
        error = err;
        done();
      });
    });

    it('should not return an error', () => {
      expect(error).to.be.undefined;
    });
  });

  describe('when calling register with no serverUrl', () => {
    let error;
    beforeEach((done) => {
      plugin.register({ batchInterval: 25 }, {}, (err) => {
        error = err;
        done();
      });
    });

    it('should return an error saying is serverUrl invalid', () => {
      expect(error.toString()).to.contain('The serverUrl parameter is invalid');
    });
  });

  describe('when calling with the correct options', () => {
    beforeEach((done) => {
      plugin.register({
        batchInterval: 25, serverUrl: 'http://graphql'
      }, {}, done);
    });

    it('should call createBatchingNetworkInterface', () => {
      expect(clientMock.createBatchingNetworkInterface.called).to.be.true;
    });

    it('should call ApolloClient', () => {
      expect(clientMock.ApolloClient.called).to.be.true;
    });
  });

  describe('when calling excute', () => {
    let client;
    beforeEach((done) => {
      plugin.register({ batchInterval: 25, serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should expose a query method', () => {
      expect(client).to.have.property('query');
    });

    it('should expose a queryBuilder method', () => {
      expect(client).to.have.property('queryBuilder');
    });
  });
  describe('when calling query with headers', () => {

    beforeEach((done) => {
      plugin.register({ batchInterval: 25, serverUrl: 'http://graphql' }
        , {}, () => {
          const client = plugin.execute();
          client.query({ query: {}, variables: { test: 1 } }, { 'accept-language': 'en-US' });
          done();
        });
    });

    it('should call apollo client with merged headers', () => {
      const expectedResult = { query: {}, variables: { test: 1, __headers: { 'accept-language': 'en-US' } } };
      expect(queryMock.calledWith(expectedResult)).to.be.true;
    });
  });
});