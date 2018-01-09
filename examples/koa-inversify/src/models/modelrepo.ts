
import * as Knex from 'knex';
import * as Objection from 'objection';
import {Repo, StampedRepo, RepoObject, StampedRepoObject} from './repo';

export class Model extends Objection.Model implements RepoObject
{
    id: number;
}

export class StampedModel extends Model implements StampedRepoObject
{
    createdAt: Date;
    updatedAt: Date;

    $beforeInsert(context: Objection.QueryContext) {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    $beforeUpdate(opt: Objection.ModelOptions, context: Objection.QueryContext) {
        this.updatedAt = new Date();
    }

    $parseDatabaseJson(json: object) {
        json = super.$parseDatabaseJson(json);
        toDate(json, 'createdAt');
        toDate(json, 'updatedAt');
        return json;
    }

    $formatDatabaseJson(json: object) {
        json = super.$formatDatabaseJson(json);
        toTime(json, 'createdAt');
        toTime(json, 'updatedAt');
        return json;
    }
}

export class ModelRepo<M extends Model> implements Repo<M> 
{
    Model: Objection.ModelClass<M>;

    constructor(modelClass: Objection.ModelClass<M>, knex: Knex) {
        this.Model = modelClass.bindKnex(knex);
    }

    // Including ...args allows subclasses to override with additional arguments
    store(obj: M, ...args: any[]) {
        if (obj.id === undefined) {
            return this.Model.query().insert(obj).then(model => {});
        }
        return this.Model.query().update(obj).where('id', obj.id).then(models => {});
    }

    transaction(callback: (trx: Objection.Transaction) => Promise<any>) {
        return Objection.transaction(this.Model.knex(), callback);
    }
}

export class StampedModelRepo<M extends StampedModel>
    extends ModelRepo<M> implements StampedRepo<M>
{
    // Including ...args allows subclasses to override with additional arguments
    store(obj: M, ...args: any[]) {
        if (obj.id === undefined) {
            return this.Model.query().insert(obj).then(model => {});
        }
        return this.Model.query().update(obj).where('id', obj.id).then(models => {});
    }
}

function toDate(obj: any, fieldName: string): any {
  if (obj != null && typeof obj[fieldName] === 'number') {
    obj[fieldName] = new Date(obj[fieldName]);
  }
  return obj;
}

function toTime(obj: any, fieldName: string): any {
  if (obj != null && obj[fieldName] != null && obj[fieldName].getTime) {
    obj[fieldName] = obj[fieldName].getTime();
  }
  return obj;
}
