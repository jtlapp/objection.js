# Example of encapsulating objection.js behind Typescript interfaces

NOTE: Project is still under development.

This example project demonstrates a way to encapsulate Objection.js behind Typescript interfaces. It hides the Objection.js implementation behind an abstract repository and allows for transparently replacing the repository implementation. The solution supports dynamic deployment configuration and allows for dependency injection. It also happens to demonstrate deployment in the context of a koa server.

Wrapping Objection.js behind interfaces can be helpful for the following reasons:

- It becomes less risky to invest in Objection.js, because you can readily switch out the Objection.js solution for another solution without affecting the rest of the application.
- Should you find that different database solutions are needed for different deployments, you can easily deploy Objection.js/RDBMS in one context and another solution such as REDIS in another.
- In cases where it is difficult to emulate a runtime environment by prepopulating a database, you can mock the Objection.js solution to automate behavior for testing purposes -- without having to emulate the rich Objection.js API.
- It demonstrates using Objection.js with Typescript and making good use of Typescript for the purpose.

The demo treats a collection of related Objection.js models as a repository. Each repository consists of repository objects and brokers. A broker is an interface to the repository that accesses the repository through a particular type of object. A repository object is thus an abstraction of an Objection.js model, and a broker is thus an abstraction of the static methods of a particular model.

The demo also provides a web service whose implementation is independent of the implementation of the repository. This demonstrates writing end point code that works regardless of the repository implementation, allowing for an Objection.js to be transparently switched out for some other implementaton, thus taking advantage of the repository abstraction.

The example repository exposes Objection.js eager graphs to the client. It's unlikely that this functionality would translate to many other repository implementations, but the example is there to show how it would be done through an interface that is otherwise independent of Objection.js.

# Install and run

```sh
git clone git@github.com:jtlapp/objection.js.git objection
cd objection/examples/ts-wrapper
npm install
# We use knex for migrations in this example.
npm install knex -g
# This runs tsc (the TypeScript compiler)
# then executes the app, which creates the sqlite db automatically:
npm start
```

A mocha test suite demonstrates use of the server:

```sh
mocha test.js
```
