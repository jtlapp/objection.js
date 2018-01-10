import * as Router from 'koa-router';
import {PersonModelBroker} from './models/PersonModel';
import {MovieModelBroker} from './models/MovieModel';
import {AnimalModelBroker} from './models/AnimalModel';

export function registerPersonAPI(router: Router, personBroker: PersonModelBroker) {

  // Create a new Person. Because we use `insertGraph` you can pass relations
  // with the person and they also get inserted and related to the person.
  router.post('/persons', async ctx => {
    const graph = ctx.request.body;
    const allow = '[pets, children.[pets, movies], movies, parent]';
    // Return inserted graph.
    ctx.body = await personBroker.storeGraph(graph, allow);
  });

  // Patch and retrieve a Person.
  router.patch('/persons/:id', async ctx => {
    // Return modified person.
    ctx.body = await personBroker.modifyAndGet(ctx.params.id, ctx.request.body);
  });

  // Patch a person and upsert its relations.
  router.patch('/persons/:id/upsert', async ctx => {
    const graph = ctx.request.body;
    const allow = '[pets, children.[pets, movies], movies, parent]';

    // Make sure only one person was sent.
    if (Array.isArray(graph)) {
      throw createStatusCodeError(400);
    }
    const id = parseInt(ctx.params.id, 10);
    
    // Return upserted graph.
    ctx.body = await personBroker.modifyGraph(id, graph, allow);
  });

  // Gets a single person.
  router.get('/persons/:id', async ctx => {
    ctx.body = await personBroker.get(ctx.params.id);
  });

  // Get multiple Persons. The result can be filtered using query parameters
  // `minAge`, `maxAge` and `firstName`.
  router.get('/persons', async ctx => {
    const allow = '[pets, parent, children.[pets, movies.actors], movies.actors.pets]';
    // Return array of persons.
    ctx.body = await personBroker.getGraph(ctx.query.eager, allow, ctx.query);
  });

  // Delete a person.
  router.delete('/persons/:id', async ctx => {
    await personBroker.drop(ctx.params.id);
    ctx.body = {};
  });

  // Add children for a Person.
  router.post('/persons/:id/children', async ctx => {
    // Return the added child.
    ctx.body = await personBroker.addChildren(ctx.params.id, ctx.request.body);
  });

  // Add pets for a Person.
  router.post('/persons/:id/pets', async ctx => {
    // Return the added pets.
    ctx.body = await personBroker.addPets(ctx.params.id, ctx.request.body);
  });

  // Get a Person's pets. The result can be filtered using query parameters
  // `name` and `species`.
  router.get('/persons/:id/pets', async ctx => {
    ctx.body = await personBroker.getPets(ctx.params.id, ctx.query);
  });

  // Add movies for a Person.
  router.post('/persons/:id/movies', async ctx => {
    // Return the person's movies.
    ctx.body = await personBroker.addMovies(ctx.params.id, ctx.request.body);
  });

  // Get a Person's movies.
  router.get('/persons/:id/movies', async ctx => {
    ctx.body = await personBroker.getMovies(ctx.params.id);
  });
}

export function registerMovieAPI(router: Router, movieBroker: MovieModelBroker) {

  // Add existing Person as an actor to a movie.
  router.post('/movies/:id/actors', async ctx => {
    // Return movie.
    ctx.body = await movieBroker.addActor(ctx.params.id, ctx.request.body.id);
  });

  // Get Movie's actors.
  router.get('/movies/:id/actors', async ctx => {
    ctx.body = await movieBroker.getActors(ctx.params.id);
  });

  // Get a Movie.
  router.get('/movies/:id', async ctx => {
    ctx.body = await movieBroker.get(ctx.params.id);
  });
}

export function registerAnimalAPI(router: Router, animalBroker: AnimalModelBroker) {

  // Gets a Pet.
  router.get('/pets/:id', async ctx => {
    ctx.body = await animalBroker.get(ctx.params.id);
  });
}

// The error returned by this function is handled in the error handler middleware in app.js.
function createStatusCodeError(statusCode: number) {
  return Object.assign(new Error(), {
    statusCode
  });
}
