import * as Knex from 'knex';
import {ModelClass} from 'objection';
import {MovieStarRepo} from '../repos/MovieStarRepo';
import {PersonModel, PersonModelBroker} from '../models/PersonModel';
import {MovieModel, MovieModelBroker} from '../models/MovieModel';
import {AnimalModel, AnimalModelBroker} from '../models/AnimalModel';

export interface MovieStarModelRepo extends MovieStarRepo { }
export class MovieStarModelRepo implements MovieStarRepo {

    constructor(knex: Knex) {
        this.personBroker = new PersonModelBroker(PersonModel as ModelClass<PersonModel>, knex);
        this.animalBroker = new AnimalModelBroker(AnimalModel as ModelClass<AnimalModel>, knex);
        this.movieBroker = new MovieModelBroker(MovieModel as ModelClass<MovieModel>, knex);
    }
}
