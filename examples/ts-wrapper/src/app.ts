import * as Minimist from 'minimist';
import * as Koa from 'koa';
import * as logger from 'koa-morgan';
import * as bodyparser from 'koa-bodyparser';
import * as Router from 'koa-router';
import * as json from 'koa-json';
import {join} from 'path';
import {ValidationError} from 'objection';
import {Deployment} from './deployments/Deployment';

// Process command line arguments.

const args = Minimist(process.argv.slice(2), {
    alias: {
        h: 'help'
    },
    boolean: [ 'h' ],
    string: [
        'deploy',
        'port'
    ],
    default: { }
});

if (args.help) {
    console.log("node app.js [--port=N] [--deploy=<deployment-filename>]");
    process.exit();
}

let port = 8641;
if (typeof args.port === 'string') {
    port = Number(args.port);
    if (Number.isNaN(port) || !Number.isInteger(port)) {
        console.log("invalid port number")
        process.exit(1);
    }
}

let deploymentFilename = 'default';
if (typeof args.deploy === 'string') {
  deploymentFilename = args.deploy;
}

// Error handling. The `ValidationError` instances thrown by objection.js have a `statusCode`
// property that is sent as the status code of the response.

async function errorHandler(ctx: Router.IRouterContext, next: () => Promise<any>) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    if (err instanceof ValidationError) {
      ctx.body = {message: 'Invalid request parameter(s)', data: err.data};
    } else if (ctx.status === 500) {
      ctx.app.emit('error', err, ctx);
    } else {
      ctx.body = {message: err.message || 'An error occurred'};
    }
  }
}

// Configure and launch the server.

const app = new Koa()
  .use(json({pretty: true}))
  .use(errorHandler)
  .use(logger('dev'))
  .use(bodyparser());

const deployment = <Deployment>require(join(__dirname, 'deployments/', deploymentFilename));
deployment.config(app);

const server = app.listen(port, () => {
  console.log('Example app listening at port %s', server.address().port);
});
