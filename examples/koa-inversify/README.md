# Typescript + Koa with Dependency Injection Example

This example project encapsulates Objection.js behind Typescript interfaces and demonstrates instantiating an Objection.js implementation via dependency injection. It should be helpful for the following reasons:

- It's less of a risk to try Objection.js, because you can readily switch out the Objection.js solution for another solution without affecting the rest of the application.
- Should you find that different database solutions are needed for different deployments, you can easily deploy Objection.js/RDBMS in one context and another solution such as REDIS in another.
- In cases where it is difficult to emulate a runtime environment by prepopulating a database, you can mock the Objection.js solution to automate behavior for testing purposes -- without having to emulate the rich Objection.js API.
- It demonstrates using Objection.js with Typescript and making good use of Typescript for the purpose.

The project manually implements dependency injection instead of using an DI framework, in order to illustrate Objection.js DI in a way that might translate to any DI framework.

Although this project employs DI, it does not do so in a strictly IOC way. Instead, the instantiable units are groupings that must work well together, and object types are encapsulated within those groupings. In particular, the project creates a repository for encapsulating access to the database and a web service for encapsulating access to REST end points; these are the injectable, interchangeable units.

# Install and run

TBD: Fix. There are now mocha tests.

```sh
git clone git@github.com:Vincit/objection.js.git objection
cd objection/examples/express-ts
npm install
# We use knex for migrations in this example.
npm install knex -g
# This runs tsc (the TypeScript compiler)
# then executes the app, which creates the sqlite db automatically:
npm start
```

`example-requests.sh` file contains a bunch of `curl` commands for you to start playing with the REST API:

```sh
cat example-requests.sh
```
