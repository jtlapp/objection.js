import * as Knex from 'knex';
import * as Koa from 'koa';
import * as logger from 'koa-morgan';
import * as bodyparser from 'koa-bodyparser';
import * as Router from 'koa-router';
import * as json from 'koa-json';
import {ModelClass, ValidationError} from 'objection';
import {PersonModel, PersonModelRepo} from './models/PersonModel';
import {MovieModel, MovieModelRepo} from './models/MovieModel';
import {AnimalModel, AnimalModelRepo} from './models/AnimalModel';
import * as api from './api';

const knexConfig = require('../knexfile');
const knex = Knex(knexConfig.development);
const personModelRepo = new PersonModelRepo(PersonModel as ModelClass<PersonModel>, knex);
const movieModelRepo = new MovieModelRepo(MovieModel as ModelClass<MovieModel>, knex);
const animalModelRepo = new AnimalModelRepo(AnimalModel as ModelClass<AnimalModel>, knex);

// Create or migrate:
knex.migrate.latest();

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

const router = new Router();

const app = new Koa()
  .use(json({pretty: true}))
  .use(errorHandler)
  .use(logger('dev'))
  .use(bodyparser())
  .use(router.routes());

// Register our REST API.
api.registerPersonAPI(router, personModelRepo);
api.registerMovieAPI(router, movieModelRepo);
api.registerAnimalAPI(router, animalModelRepo);

const server = app.listen(8641, () => {
  console.log('Example app listening at port %s', server.address().port);
});
