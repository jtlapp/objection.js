import * as Knex from 'knex';
import * as Koa from 'koa';
import {Deployment} from './Deployment';
import {MovieStarService} from '../services/MovieStarService';
import {MovieStarModelRepo} from '../repos/MovieStarModelRepo';

class ObjectionDeployment implements Deployment {
    config(app: Koa) {
        const knexConfig = require('../../knexfile');
        const knex = Knex(knexConfig[app.env]);

        // Create or migrate:
        knex.migrate.latest();
        new MovieStarService(app, new MovieStarModelRepo(knex));
    }
}

export const config = new ObjectionDeployment().config;
