Here's the English version of the README:
# wampark

Wampark is a library designed to simplify the creation of microservices based on WAMP (Web Application Messaging Protocol) in Node.js.

## Installation

You can install `wampark` using npm:

```bash
npm install wampark
```

## Usage

Here is a basic example of how to set up and start a WAMP server using `wampark`.

### Environment Configuration

Create a `.env` file in the root of your project and add the following environment variables:

```plaintext
# If you want to use multi threads
USE_WORKER_THREADS=true
WAMP_URL=ws://localhost:9001/ws
WAMP_REALM=realm1
WAMP_AUTHID=backend-service-user
WAMP_AUTHPASS=authP4555ec3tB4ck
```

### Example Code

#### index.js

```javascript
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import application, { ApplicationError } from 'wampark';
import MyRouteSample from './MyRouteSample.js';
import { isMainThread } from 'worker_threads';

const __filename = fileURLToPath(import.meta.url);

application.setup({
  use_worker_threads: process.env.USE_WORKER_THREADS === 'true',
  worker_filepath: __filename,

  wamp: {
    url: process.env.WAMP_URL,
    realm: process.env.WAMP_REALM,
    authid: process.env.WAMP_AUTHID,
    authpass: process.env.WAMP_AUTHPASS,
  }
});

application.attachRoute(MyRouteSample);

application.start();

if (isMainThread) {
  application.on('connected', (session) => {
    application.session.call('routes.MyRouteSample', [], {counter: 10})
    .then(result => {
      console.log('RPC result is', result)
      application.session.publish('events.MyRouteSample', [], {message: 'Hello World!'})
    })
    .catch(err => {
      let error = ApplicationError.parse(err);
      console.log(`RPC throws an error`, error);
    });
  });
}
```

#### MyRouteSample.js

```javascript
import { Route } from 'wampark';

export default class MyRouteSample extends Route {
  static settings = {
    type: Route.RouteTypes.RPC,
    uri: 'routes.myRouteSample'
  };

  static count = 0;

  async endpoint ({args = [], kwargs = {}, details = {}}) {
    const { counter } = kwargs;
    return counter * 2;
  }
}
```

## About WAMP

WAMP (Web Application Messaging Protocol) is a protocol for real-time message routing in web and mobile applications. It supports RPC (Remote Procedure Calls) and Pub/Sub (Publish/Subscribe), enabling efficient and scalable communication between distributed components of an application.

## Contributing

Feel free to contribute to this project. Submit pull requests or open issues on the [GitHub repository](https://github.com/rafael-freitas/wampark).

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for more information.
