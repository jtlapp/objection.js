import * as Knex from 'knex';
import * as Objection from 'objection';
import {Broker, BrokerObject} from '../dilib/Broker';

export class Model extends Objection.Model implements BrokerObject
{
    id: number;
}

export class ModelBroker<M extends Model> implements Broker<M> 
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
