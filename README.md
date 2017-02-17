oc-graphql-client [![Build Status](https://travis-ci.org/opentable/oc-graphql-client.svg?branch=master)](https://travis-ci.org/opentable/oc-graphql-client)
==========

A OpenComponents plugin that expose the [Apollo-Client](http://dev.apollodata.com/) for interacting with a GraphQL based server.

## Requirements:
- OC Registry
- GraphQL Server

## Install

````javascript
yarn add oc-graphql-client
````

## Registry setup

More info about integrating OC plugins: [here](https://github.com/opentable/oc/wiki/Registry#plugins)

````javascript
...
var registry = new oc.registry(configuration);

registry.register({
  name: 'graphqlClient',
  register: require('oc-graphql-client'),
  options: {
    host: 'http://graphql-server.hosts.com',
    batchInterval: 10,
    errorHandler: function(err){
      console.log(err);
    }
  }
}, function(err){
  if(err){
    console.log('plugin initialisation failed:', err);
  } else {
    console.log('graphql client now available');
  }
});

...

registry.start(callback);
````

## Usage

Example for a components' server.js:

````javascript

module.exports.data = function(context, callback){
  let qb = context.plugins.graphql.queryBuilder;

  let query = qb`restaurant(id: 4) {
    name
  }`;

  context.plugins.graphql.query({query})
    .then(res => { ... })
    .catch(err => { ... })
````

## API

|parameter|type|mandatory|description|
|---------|----|---------|-----------|
|errorHandler|`function`|no|The error handler|
|serverUrl|`string`|yes|The Url for the GraphQL server|
|batchInterval|`number`|no|The default is a 10ms window for batching queries|

## Contributing

PR's are welcome!

## License

MIT