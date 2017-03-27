oc-graphql-client [![Build Status](https://travis-ci.org/opentable/oc-graphql-client.svg?branch=master)](https://travis-ci.org/opentable/oc-graphql-client)
==========

## NOTICE!
- The current released version (3.*) does not use the Apollo client due to memory consumption issues.
- The client does not expose a querybuilder, instead just use a raw string as the examples does.

----

A [OpenComponents](https://github.com/opentable/oc) plugin that expose the a graphql client for interacting with a GraphQL based server.

## Requirements:
- OC Registry
- GraphQL Server
- Node >= v6

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
    serverUrl: 'http://graphql-server.hosts.com'
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


## Register API

|parameter|type|mandatory|description|
|---------|----|---------|-----------|
|serverUrl|`string`|yes|The Url for the GraphQL server|

## Usage

Example for a components' server.js:

````javascript

module.exports.data = function(context, callback){
  const query = `
  query restaurantInfo($id: Int!) {
      restaurant(id: $id) {
        name
    }
  }`;

  const headers = {
    'accept-language': 'en-US, en'
  };

  context.plugins.graphql.query({ query, variables: { id: 4 } }, headers, timeout)
    .then(res => { ... })
    .catch(err => { ... })
````

## API

|parameter|type|mandatory|description|
|---------|----|---------|-----------|
|options|`object`|yes|A composite of the query & variables to pass to GraphQL server|
|headers|`object`|no|The headers to pass down to unerlying services|
|timeout|`int`|no|The timeout in ms. It defaults to OS default |

## Contributing

PR's are welcome!

## License

MIT
