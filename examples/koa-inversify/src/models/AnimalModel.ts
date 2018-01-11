import * as Objection from 'objection';
import {join} from 'path';
import {Model, ModelBroker} from './Model';
import {AnimalSpec, Animal, AnimalBroker} from '../brokers/AnimalBroker';

export interface AnimalModel extends Animal { }
export class AnimalModel extends Model {

  // Table name is the only required property.
  static tableName = 'Animal';

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static jsonSchema = {
    type: 'object',
    required: ['name'],

    properties: {
      id: {type: 'integer'},
      ownerId: {type: ['integer', 'null']},
      name: {type: 'string', minLength: 1, maxLength: 255},
      species: {type: 'string', minLength: 1, maxLength: 255}
    }
  };

  // This object defines the relations to other models.
  static relationMappings = {
    owner: {
      relation: Objection.Model.BelongsToOneRelation,
      // The related model. This can be either a Model subclass constructor or an
      // absolute file path to a module that exports one. We use the file path version
      // here to prevent require loops.
      modelClass: join(__dirname, 'PersonModel'),
      join: {
        from: 'Animal.ownerId',
        to: 'Person.id'
      }
    }
  };
}
export default AnimalModel;

export class AnimalModelBroker extends ModelBroker<AnimalModel> implements AnimalBroker 
{
  create(animalInfo: AnimalSpec) {
    // returns an instance; throws Objection.ValidationError
    return this.Model.fromJson(animalInfo);
  }

  get(animalID: number) {
    return this.Model.query().findById(animalID);
  }
}
