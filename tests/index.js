const { expect } = require('chai');
const injectr = require('injectr');
const sinon = require('sinon');

describe('OpenTable OC registry :: plugins :: graphql-plugin ', () => {

  describe('when calling register with an valid batchInterval', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });

    let error;
    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }, {}, (err) => {
        error = err;
        done();
      });
    });

    it('should not return an error', () => {
      expect(error).to.be.undefined;
    });
  });

  describe('when calling register with no serverUrl', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });
    let error;
    beforeEach((done) => {
      plugin.register({}, {}, (err) => {
        error = err;
        done();
      });
    });

    it('should return an error saying is serverUrl invalid', () => {
      expect(error.toString()).to.contain('The serverUrl parameter is invalid');
    });
  });

  describe('when calling with the correct options', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });
    const next = sinon.spy();

    beforeEach((done) => {
      plugin.register({
        serverUrl: 'http://graphql'
      }, {}, next);
      done();
    });

    it('should call next', () => {
      expect(next.called).to.be.true;
    });
  });

  describe('when calling execute', () => {
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, {}, 'ok')
    });
    let client;
    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should expose a query method', () => {
      expect(client).to.have.property('query');
    });
  });

  describe('when calling query and endpoint fails with an invalid response', () => {
    let client;
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, { statusCode: 500}, null)
    });

    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should reject with a graphql compliant object with an error', (done) => {
      client.query({ query: {}, variables: { test: 1 } }, { 'accept-language': 'en-US' })
        .catch(resp => {
          expect(resp.errors).to.deep.equal(['Invalid response from graphql server. Internal Server Error'])
        }).then(done, done)
    });
  });

  describe('when calling query and recieving errors', () => {
    let client;
    const body = {
      errors: [ { message: 'Field "xyz" argument "jkl" of type "Type!" is required but not provided.' } ]
    };
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, { statusCode: 400 }, body)
    });

    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should reject with the body with errors', (done) => {
      client.query({ query: {}, variables: { test: 1 } }, { 'accept-language': 'en-US' })
        .catch(error => {
          expect(error).to.deep.equal(body)
        }).then(done, done)
    });
  });

  describe('when calling query and no data', () => {
    let client;
    const body = {  }; // under sensible conditions, there would be errors, but the spec doesn't mandate this.
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, { statusCode: 200 }, body)
    });

    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should reject with the body', (done) => {
      client.query({ query: {}, variables: { test: 1 } }, { 'accept-language': 'en-US' })
        .catch(error => {
          expect(error).to.deep.equal(body)
        }).then(done, done)
    });
  });

  describe('when calling query successfully', () => {
    let client;
    const plugin = injectr('../index.js', {
      request: sinon.stub().yields(null, { statusCode: 200}, { data: {someJson: true } })
    });

    beforeEach((done) => {
      plugin.register({ serverUrl: 'http://graphql' }
        , {}, () => {
          client = plugin.execute();
          done();
        });
    });

    it('should return the json response data', (done) => {
      client.query({ query: {}, variables: { test: 1 } }, { 'accept-language': 'en-US' })
        .then(res => {
          expect(res).to.eql({ data: { someJson: true } })
        }).then(done, done)
    });
  });
});