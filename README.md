### Comprehensive Developer Documentation for Wampark

This documentation will guide developers on how to use and contribute to the Wampark library for creating WAMP (Web Application Messaging Protocol) based microservices in Node.js.

---

# Wampark

Wampark is a library designed to simplify the creation of microservices based on WAMP (Web Application Messaging Protocol) in Node.js.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [Environment Configuration](#environment-configuration)
  - [Basic Example](#basic-example)
  - [Detailed Module Descriptions](#detailed-module-descriptions)
    - [Application](#application)
    - [Route](#route)
    - [Component](#component)
    - [WampAdapter](#wampadapter)
    - [ApplicationError](#applicationerror)
    - [Plugins](#plugins)
    - [HTTP Routes](#http-routes)
    - [WAMP Services](#wamp-services)
- [About WAMP](#about-wamp)
- [Contributing](#contributing)
- [License](#license)

## Installation

You can install `wampark` using npm:

```bash
npm install wampark
```

## Usage

### Environment Configuration

Create a `.env` file in the root of your project and add the following environment variables:

```plaintext
# If you want to use multi threads
USE_WORKER_THREADS=true
WAMP_URL=ws://localhost:9001/ws
WAMP_REALM=realm1
WAMP_AUTHID=yourUserHere
WAMP_AUTHPASS=yourSecretePassHere
DB_URI=mongodb://localhost:27017/yourdb
HTTP_PORT=3000
HTTP_HOST=localhost
JWT_SALT=your_jwt_salt
```

### Basic Example

#### index.js

```javascript
import { fileURLToPath } from 'url';
import application from 'wampark';

// Plugins
import mongodb from './plugins/mongodb.js';
import httpserver from './plugins/httpserver.js';

// HTTP Routes
import privateRoutes from './http/routes/private.route.js';
import publicRoutes from './http/routes/public.route.js';
import uploadRoutes from './http/routes/upload.route.js';
import downloadRoutes from './http/routes/download.route.js';
import routeRoutes from './http/routes/route.route.js';

// WAMP Services
import ServiceAuthorizer from './services/services.authorizer.js';
import ServiceTicketAuthentication from './services/services.authenticate.ticket.js';
import ServiceRoutes from './services/services.routes.js';

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

// Install Plugins
application.plugin(mongodb);
application.plugin(httpserver);

// Attach WAMP Services
application.attachRoute(ServiceAuthorizer);
application.attachRoute(ServiceTicketAuthentication);
application.attachRoute(ServiceRoutes);

// Use HTTP Routes
httpserver.use(routeRoutes.routes());
httpserver.use(privateRoutes.routes());
httpserver.use(publicRoutes.routes());
httpserver.use(uploadRoutes.routes());
httpserver.use(downloadRoutes.routes());

application.start();
```

## Detailed Module Descriptions

### Application

The `Application` class is a singleton that extends `EventEmitter` to support your application events.

#### Properties and Methods

| Property/Method            | Description                                                                                         |
|-----------------------------|-----------------------------------------------------------------------------------------------------|
| `wamp`                      | Instance of `WampAdapter`. Represents the WAMP connection.                                          |
| `settings`                  | Object containing the configuration settings.                                                       |
| `plugins`                   | Map containing the installed plugins.                                                               |
| `workers`                   | Map containing the workers.                                                                         |
| `workersMessagesId`         | Identifier for worker messages.                                                                     |
| `workersTaskQueue`          | Array containing the tasks for workers.                                                             |
| `workersTaskBusy`           | Map containing the busy worker tasks.                                                               |
| `session`                   | Getter for the current WAMP session.                                                                |
| `plugin(plugin)`            | Method to install a plugin.                                                                         |
| `setup(settings)`           | Method to setup the application with custom settings.                                               |
| `startPlugins()`            | Method to start the installed plugins.                                                              |
| `start()`                   | Method to start the application.                                                                    |
| `createWorkers()`           | Method to create worker threads.                                                                    |
| `getIdleWorker()`           | Method to get an idle worker.                                                                       |
| `getNextMessageId()`        | Method to get the next message ID for workers.                                                      |
| `createWorker(safe)`        | Method to create a new worker.                                                                      |
| `assignWorkerTask(task)`    | Method to assign a task to a worker.                                                                |
| `assignNextWorkerTask()`    | Method to assign the next task in the queue to an idle worker.                                      |
| `sendMessageToWorker(task)` | Method to send a message to a worker.                                                               |
| `connect(settings)`         | Method to connect to the WAMP server.                                                               |
| `onSessionOpen(session)`    | Method called when a WAMP session is opened.                                                        |
| `onSessionClose(reason, details)` | Method called when a WAMP session is closed.                                                  |
| `attachRoute(RouteClass)`   | Method to attach a route to the application.                                                        |
| `attachAgentToSession()`    | Method to attach the agent RPC route for a Crossbar.io session when connected.                     |
| `isSubclass(childClass, parentClass)` | Static method to check if a class is a subclass of another class.                        |

#### Example Usage

```javascript
import application from 'wampark';

application.setup({
  use_worker_threads: true,
  worker_filepath: __filename,
  wamp: {
    url: 'ws://localhost:9001/ws',
    realm: 'realm1',
    authid: 'backend-service-user',
    authpass: 'authP4555ec3tB4ck',
  }
});

application.start();
```

#### Detailed Explanation of Methods

- **plugin(plugin)**: Installs a plugin by calling its `install` method if available and marking it as installed.
- **setup(settings)**: Configures the application with provided settings, including WAMP connection settings.
- **startPlugins()**: Starts all installed plugins by calling their `start` method if available.
- **start()**: Starts the application, opens the WAMP connection, and emits a `start` event.
- **createWorkers()**: Creates worker threads if the application is not running in the main thread.
- **getIdleWorker()**: Returns an idle worker or null if no idle workers are available.
- **getNextMessageId()**: Generates a unique message ID for worker communication.
- **createWorker(safe)**: Creates a new worker thread and sets up message, error, and exit handlers.
- **assignWorkerTask(task)**: Assigns a task to an idle worker or adds it to the task queue if no idle workers are available.
- **assignNextWorkerTask()**: Assigns the next task in the queue to an idle worker.
- **sendMessageToWorker(task)**: Sends a message to a worker and returns the message ID.
- **connect(settings)**: Establishes a WAMP connection using the provided settings.
- **onSessionOpen(session)**: Handles the opening of a WAMP session and emits a `connected` event.
- **onSessionClose(reason, details)**: Handles the closing of a WAMP session and emits a `disconnected` event.
- **attachRoute(RouteClass)**: Attaches a route to the application, setting up WAMP session handlers.
- **attachAgentToSession()**: Registers an agent RPC procedure for the current WAMP session when connected.
- **isSubclass(childClass, parentClass)**: Checks if `childClass` is a subclass of `parentClass`.

### Route

The `Route` class should be extended for creating routes in your WAMP application.

#### Example Route

```javascript
import { Route } from 'wampark';

export default class MyRoute extends Route {
  static {
    this.type = Route.RouteTypes.RPC;
    this.uri = 'routes.myRoute';
  }

  async endpoint({ args, kwargs, details }) {
    // Your logic here
  }
}
```

### Component

The `Component` class is used to create a client-side UI component interface.

#### Example Component

```javascript
import Component from 'wampark';

const myComponent = new Component('#myComponent', myRouteInstance);
myComponent.method('myMethod', 'arg1', 'arg2');
```

### WampAdapter

The `WampAdapter` class connects to a WAMP Crossbar.io server via Autobahn.

#### Example Usage

```javascript
import WampAdapter from 'wampark';

const wampAdapter = new WampAdapter({
  url: 'ws://localhost:9001/ws',
  realm: 'realm1',
  authid: 'yourUserHere',
  authpass: 'yourPassHere',
  autoconnect: true,
  onopen: (session) => {
    console.log('Connected to WAMP server', session);
  },
  onclose: (reason, details) => {
    console.log('Connection closed', reason, details);
  }
});
```

### ApplicationError

The `ApplicationError` class extends the native `Error` class and represents errors in the system.

#### Properties and Methods

| Property/Method                | Description                                                                                      |
|--------------------------------|--------------------------------------------------------------------------------------------------|
| `assert`                       | Wrapper for Node.js `assert` module that throws `ApplicationError` on assertion failure.         |
| `toObject()`                   | Converts an error to a plain object.                                                             |
| `throw()`                      | Throws the error if it is throwable.                                                             |
| `setCode(code)`                | Sets the error code with the family prefix.                                                      |
| `setType(type)`                | Sets the error type.                                                                             |
| `setFamily(family)`            | Sets the family prefix for the error code.                                                       |
| `toJSON()`                     | Converts the error instance to a JSON string.                                                    |
| `toString()`                   | Converts the error instance to a string.                                                         |
| `stripCodeFromDescription(description, code)` | Parses the error code and message from the description.                           |
| `wrapper(error)`               | Wraps a native error as an `ApplicationError`.                                                   |
| `cancelProc()`                 | Creates a cancellable procedure error.                                                           |
| `parse(error)`                 | Parses a WAMP or native error into an `ApplicationError`.                                        |

#### Example Usage

```javascript
import ApplicationError from 'wampark';

try {
  throw new ApplicationError('ERR001: An error occurred');
} catch (error) {
  console.error(error.toString());
}
```

### Plugins

Wampark supports plugins to extend its functionality. Here are some examples:

#### MongoDB Plugin

```javascript
import mongoose from 'mongoose';
import Application from 'wampark';

const { log } = Application;

const connectDB = async (connectionString) => {
  try {
    log.info(`Trying to connect to MongoDB on "${log.colors.yellow(connectionString)}"`);
    await mongoose.connect(connectionString);
    log.info(`MongoDB connected in "${log.colors.yellow(connectionString)}" - ${log.ok}`);
    Application.emit('db.mongoose.connected');
  } catch (err) {
    log.error(`Fail to connect to DB "${log.colors.red(connectionString)}" Error: ${err.toString()} - ${log.fail}`);
    process.exit(1);
  }
};

export default {
  install: () => {},
  start: () => {
    connectDB(process.env.DB_URI);
  }
};
```

#### HTTP Server Plugin

```javascript
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from '@koa/cors';
import Application from 'wampark';

const server = new Koa();

server.use(cors());
server.use(logger());
server.use(bodyParser());

server.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
    ctx.app.emit('error', err, ctx);
  }
});

export default {
  use: server.use.bind(server),
  install: () => {},
  start: () => {
    const HTTP_PORT = process.env.HTTP_PORT || 3000;
    const HTTP_HOST = process.env.HTTP_HOST || 'localhost';
    server.listen(HTTP_PORT, () => {
      Application.log.info(`Server running on http://${HTTP_HOST}:${HTTP_PORT}`);
    });
  }
};
```

### HTTP Routes

Example of adding HTTP routes:

```javascript
import privateRoutes from './http/routes/private.route.js';
import publicRoutes from './http/routes/public.route.js';

httpserver.use(privateRoutes.routes());
httpserver.use(publicRoutes.routes());
```

### WAMP Services

Example of adding WAMP services:

#### ServiceAuthorizer

```javascript
import { Route, RouteTypes } from 'wampark';

export default class ServiceAuthorizer extends Route {
  static {
    this.uri = 'services.authorizer';
  }

  /**
   * Procedure to authorize frontend users.
   * Configuration in Crossbar.io config.json:
   * ```
   * {
   *     "name": "frontend",
   *     "authorizer": "server.authorizer"
   * }
   * ```
   * __Type:__ RPC
   * @event "server.authorizer"
   * @param {Object[]} args
   * @param {int} args[].0 - session: session id
   * @param {String} args[].1 - uri: route
   * @param {String} args[].2 - action: action
   * @param {Object} kwargs - not used
   * @param {Object} details - session user details
   * @return {Boolean} Returns `true` if the session user is authorized to access the route
   */
  endpoint({ args, kwargs, details }) {
    return new Promise(async (resolve, reject) => {
      const [details, uri, action] = args;
      const { session, authid } = details;
      const { log } = this.constructor;
      
      try {
        log.debug(`Crant access action: [${log.colors.data(action)}] on <${log.colors.data(uri)}> user: ${log.colors.data(authid)} on session ${log.colors.data(session)} - ${log.ok}`);
        resolve({ allow: true, disclose: true });
      } catch (error) {
        log.error(`Access deny action: [${log.colors.data(action)}] on <${log.colors.data(uri)}> user: ${log.colors.data(authid)} on session ${log.colors.data(session)} - ${log.ok}`, error);
        resolve({ allow: false, disclose: false });
      }
    });
  }
}
```

#### ServiceTicketAuthentication

Example of a service to authenticate users on Application in the realm:

```javascript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import lodash from 'lodash';
import { Route, ApplicationError } from 'wampark';
import logger from 'wampark/logger/index.js';

// User model
import Users from '../db/users/index.js';

const { isEmpty } = lodash;
const { JWT_SALT } = process.env;

if (!JWT_SALT || typeof JWT_SALT !== 'string') throw new Error('A001: JWT_SALT is invalid or is undefined');

export default class ServiceTicketAuthentication extends Route {
  static {
    this.uri = 'services.authenticate.ticket';
  }

  endpoint({ args, kwargs, details }) {
    return new Promise((resolve, reject) => {
      const [realm, authid, details] = args;
      const { log } = this.constructor;

      let ticket = lodash.get(details, 'ticket', '{}');

      if (typeof ticket === 'string') {
        ticket = JSON.parse(details.ticket);
      }

      const payload = { realm, authid, ticket };

      if (mongoose.connection.readyState !== 1) {
        log.error('Mongoose (database) not connected');
        return reject(new ApplicationError('F001: Database not connected'));
      }
      log.info(`Begin authentication for user ${log.colors.data(authid)} on realm ${log.colors.data(realm)}`);

      try {
        if (ticket.token) {
          this.verifyJwtToken(payload)
            .then(this.selectUserById.bind(this))
            .then(this.createSession.bind(this))
            .then((result) => {
              log.info(`TOKEN session for ${log.colors.data(authid)} - ${log.ok}`);
              resolve(result);
            })
            .catch((err) => {
              log.error('Token authentication fail ' + err.toString());
              console.log(err.stack.toString());
              reject(err);
            });
        } else {
          this.selectUser(payload)
            .then(this.comparePassword.bind(this))
            .then(this.createWebToken.bind(this))
            .then(this.createSession.bind(this))
            .then((result) => {
              log.info(`TICKET session for ${log.colors.data(authid)} - ${log.ok}`);
              resolve(result);
            })
            .catch((err) => {
              log.error('Credentials authentication failed', err.toString());
              console.log(err.stack.toString());
              reject(err);
            });
        }
      } catch (e) {
        log.error('Authentication fail', e.toString());
        console.error(e.stack.toString());
      }
    });
  }

  // ... your implementaion here

  createSession(payload) {
    const { user, authid, ticket, realm } = payload;

    if (isEmpty(user) || isEmpty(ticket)) return {};

    return {
      role: user.crossbarRole,
      extra: {
        realm,
        token: ticket.token,
      },
    };
  }
}
```

## About WAMP

WAMP (Web Application Messaging Protocol) is a protocol for real-time message routing in web and mobile applications. It supports RPC (Remote Procedure Calls) and Pub/Sub (Publish/Subscribe), enabling efficient and scalable communication between distributed components of an application.

## Contributing

Feel free to contribute to this project. Submit pull requests or open issues on the [GitHub repository](https://github.com/rafael-freitas/wampark).

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for more information.

---

This documentation provides a comprehensive guide for developers to use and extend the Wampark library in their Node.js projects. If there are any specific parts you need more details on or additional sections you'd like to include, please let me know!