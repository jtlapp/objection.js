import * as Knex from 'knex';
import * as Objection from 'objection';
import {Broker, BrokerObject} from '../wrapper/Broker';

export interface BaseModel extends BrokerObject { }
export class BaseModel extends Objection.Model { }

export class ModelBroker<M extends BaseModel> implements Broker<M> 
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
