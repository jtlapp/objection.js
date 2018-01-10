import * as Objection from 'objection';
import {ObjectNotFoundError} from '../dilib/Broker';
import {StampedModel, StampedModelBroker} from './StampedModel';
import {AnimalModel} from './AnimalModel';
import {MovieModel} from './MovieModel';
import {PersonSpec, Address, PersonBroker} from '../brokers/PersonBroker';

export class PersonModel extends StampedModel implements PersonSpec {
  parentId: number | null;
  firstName: string;
  lastName: string;
  age: number;
  address: Address;

  // Optional eager relations.
  parent?: PersonModel;
  children?: PersonModel[];
  pets?: AnimalModel[];
  movies?: MovieModel[];

  // Table name is the only required property.
  static tableName = 'Person';

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static jsonSchema = {
    type: 'object',
    required: ['firstName', 'lastName'],

    properties: {
      id: {type: 'integer'},
      parentId: {type: ['integer', 'null']},
      firstName: {type: 'string', minLength: 1, maxLength: 255},
      lastName: {type: 'string', minLength: 1, maxLength: 255},
      age: {type: 'number'},

      address: {
        type: 'object',
        properties: {
          street: {type: 'string'},
          city: {type: 'string'},
          zipCode: {type: 'string'}
        }
      }
    }
  };

  // Where to look for models classes.
  static modelPaths = [__dirname];

  // This object defines the relations to other models. The modelClass strings
  // will be joined to `modelPaths` to find the class definition, to avoid
  // require loops. The other solution to avoid require loops is to make
  // relationMappings a thunk. See Movie.ts for an example.
  static relationMappings: Objection.RelationMappings = {
    pets: {
      relation: Objection.Model.HasManyRelation,
      // This model defines the `modelPaths` property. Therefore we can simply use
      // the model module names in `modelClass`.
      modelClass: AnimalModel,
      join: {
        from: 'Person.id',
        to: 'Animal.ownerId'
      }
    },

    movies: {
      relation: Objection.Model.ManyToManyRelation,
      modelClass: MovieModel,
      join: {
        from: 'Person.id',
        // ManyToMany relation needs the `through` object to describe the join table.
        through: {
          from: 'Person_Movie.personId',
          to: 'Person_Movie.movieId'
        },
        to: 'Movie.id'
      }
    },

    children: {
      relation: Objection.Model.HasManyRelation,
      modelClass: PersonModel,
      join: {
        from: 'Person.id',
        to: 'Person.parentId'
      }
    },

    parent: {
      relation: Objection.Model.BelongsToOneRelation,
      modelClass: PersonModel,
      join: {
        from: 'Person.parentId',
        to: 'Person.id'
      }
    }
  };
}

export type MyFunc = ((person?: PersonModel) => Promise<PersonModel | PersonModel[]>);

export class PersonModelBroker extends StampedModelBroker<PersonModel>
  implements PersonBroker
{
  create(personInfo: PersonSpec) {
    // returns an instance; throws Objection.ValidationError
    return this.Model.fromJson(personInfo);
  }

  addChildren(personID: number, children: PersonSpec | PersonSpec[])
  {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }
        let result: Promise<PersonModel | PersonModel[]>;
        if (Array.isArray(children)) { // just to satisfy static typing
          result = person.$relatedQuery<PersonModel>('children').insert(<PersonModel[]>children);
        } else {
          result = person.$relatedQuery<PersonModel>('children').insert(<PersonModel>children);
        }
        return result;
      });
  }

  addMovies(personID: number, movies: /*TBD*/any) {
    // Inserting a movie for a person creates two queries: the movie insert query
    // and the join table row insert query. It is wise to use a transaction here.
    return this.transaction(trx => {
      return this.Model.query(trx).findById(personID)
        .then(person => {

          if (!person) {
            throw new ObjectNotFoundError('person', personID);
          }
          return person.$relatedQuery('movies', trx).insert(movies);
        });
    });
  }

  addPets(personID: number, pets: /*TBD*/any) {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }
        return person.$relatedQuery('pets').insert(pets);
      });
  }

  drop(personID: number) {
    return this.Model.query().deleteById(personID);
  }

  get(personID: number) {
    return this.Model.query().findById(personID);
  }

  getGraph(eager: string = '', allow: string = '*',
    filter: {minAge?: number, maxAge?: number, firstName?: string} = {}
  ) {
    // We don't need to check for the existence of the query parameters because
    // we call the `skipUndefined` method. It causes the query builder methods
    // to do nothing if one of the values is undefined.
    return this.Model.query()
      .skipUndefined()
      // For security reasons, limit the relations that can be fetched.
      .allowEager(allow)
      .eager(eager)
      .where('age', '>=', filter.minAge)
      .where('age', '<', filter.maxAge)
      .where('firstName', 'like', filter.firstName)
      .orderBy('firstName')
      // Order eagerly loaded pets by name.
      .modifyEager('[pets, children.pets]', qb => qb.orderBy('name'));
  }

  getPets(personID: number, filter: {name?: string, species?: string} = {}) {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }

        // We don't need to check for the existence of the query parameters because
        // we call the `skipUndefined` method. It causes the query builder methods
        // to do nothing if one of the values is undefined.
        return person
          .$relatedQuery('pets')
          .skipUndefined()
          .where('name', 'like', filter.name)
          .where('species', filter.species);
      });
  }

  getMovies(personID: number) {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }
        return person.$relatedQuery('movies');
      });
  }

  modify(personID: number, mods: Partial<PersonSpec>) {
    return this.Model.query().patch(mods as Partial<PersonModel>).where('id', personID);
  }

  modifyAndGet(personID: number, mods: Partial<PersonSpec>) {
    return this.Model.query().patchAndFetchById(personID, mods as Partial<PersonModel>);
  }

  // Patch a person and upsert its relations.
  modifyGraph(personID: number, graph: /*TBD*/any, allow = '*') {
    // Make sure the person has the correct id because `upsertGraph` uses the id fields
    // to determine which models need to be updated and which inserted.
    graph.id = personID;

    // It's a good idea to wrap `upsertGraph` call in a transaction since it
    // may create multiple queries.
    return this.transaction(trx => {
      return (
        this.Model.query(trx)
          // For security reasons, limit the relations that can be upserted.
          .allowUpsert(allow)
          .upsertGraph(graph)
      );
    });
  }

  storeGraph(graph: /*TBD*/any, allow: string = '*') {
    // It's a good idea to wrap `insertGraph` call in a transaction since it
    // may create multiple queries.
    // TBD: look at moving this to base class, including ...args
    return this.transaction(trx => {
      return (
        this.Model.query(trx)
          // For security reasons, limit the relations that can be inserted.
          .allowInsert(allow)
          .insertGraph(graph)
      );
    });
  }
}

export default PersonModel;
