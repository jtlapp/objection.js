import * as Objection from 'objection';
import {ObjectNotFoundError, EagerRelation} from '../wrapper/Broker';
import {AnimalSpec} from '../brokers/AnimalBroker';
import {MovieSpec} from '../brokers/MovieBroker';
import {StampedModel, StampedModelBroker} from './StampedModel';
import {AnimalModel} from './AnimalModel';
import {MovieModel} from './MovieModel';
import {PersonSpec, Person, PersonBroker, PersonFilter, PetFilter} from '../brokers/PersonBroker';

export interface PersonModel extends Person { }
export class PersonModel extends StampedModel {

  // Optional eager relations. These declarations are only necessary if a broker
  // will be accessing methods of models found within a graph OR if the broker
  // object interface does not expose eager relations but a broker needs them.
  parent?: EagerRelation<PersonModel>;
  children?: EagerRelation<PersonModel>[];
  pets?: EagerRelation<AnimalModel>[];
  movies?: EagerRelation<MovieModel>[];

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
// Make model available for on-demand loading in case of cyclic dependencies.
export default PersonModel;

export class PersonModelBroker extends StampedModelBroker<PersonModel>
  implements PersonBroker
{
  create(personInfo: PersonSpec) {
    // returns an instance; throws Objection.ValidationError
    return this.Model.fromJson(personInfo);
  }

  addChild(personID: number, child: PersonSpec)
  {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }
        return person.$relatedQuery<PersonModel>('children').insert(<PersonSpec>child);
      });
  }

  addChildren(personID: number, children: PersonSpec[])
  {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }
        // postgres allows batch insertions
        return person.$relatedQuery<PersonModel>('children').insert(<PersonSpec[]>children);
      });
  }

  addMovie(personID: number, movie: MovieSpec) {
    // Inserting a movie for a person creates two queries: the movie insert query
    // and the join table row insert query. It is wise to use a transaction here.
    return this.transaction(trx => {
      return this.Model.query(trx).findById(personID)
        .then(person => {

          if (!person) {
            throw new ObjectNotFoundError('person', personID);
          }
          return person.$relatedQuery<MovieModel>('movies', trx).insert(movie);
        });
    });
  }

  addMovies(personID: number, movies: MovieSpec[]) {
    // Inserting a movie for a person creates two queries: the movie insert query
    // and the join table row insert query. It is wise to use a transaction here.
    return this.transaction(trx => {
      return this.Model.query(trx).findById(personID)
        .then(person => {

          if (!person) {
            throw new ObjectNotFoundError('person', personID);
          }
          // postgres allows batch insertions
          return person.$relatedQuery<MovieModel>('movies', trx).insert(<MovieSpec[]>movies);
        });
    });
  }

  addPet(personID: number, pet: AnimalSpec) {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }
        return person.$relatedQuery<AnimalModel>('pets').insert(pet);
      });
  }

  addPets(personID: number, pets: AnimalSpec[]) {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }
        // postgres allows batch insertions
        return person.$relatedQuery<AnimalModel>('pets').insert(pets);
      });
  }

  drop(personID: number) {
    return this.Model.query().deleteById(personID).then(dropCount => {
      return (dropCount === 1);
    });
  }

  get(personID: number) {
    return this.Model.query().findById(personID);
  }

  getGraph(eager: string = '', allow: string = '*', filter: PersonFilter = {}) {
    // We don't need to check for the existence of the query parameters because
    // we call the `skipUndefined` method. It causes the query builder methods
    // to do nothing if one of the values is undefined.
    return <Promise<Person[]>><any>this.Model.query() // TBD: fix type after typings fixed
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

  getPets(personID: number, filter: PetFilter = {}) {
    return this.Model.query().findById(personID)
      .then(person => {

        if (!person) {
          throw new ObjectNotFoundError('person', personID);
        }

        // We don't need to check for the existence of the query parameters because
        // we call the `skipUndefined` method. It causes the query builder methods
        // to do nothing if one of the values is undefined.
        return person
          .$relatedQuery<AnimalModel>('pets')
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
        return person.$relatedQuery<MovieModel>('movies');
      });
  }

  modify(personID: number, mods: Partial<PersonSpec>) {
    return this.Model.query().patch(mods).where('id', personID).then((patchCount: any) => {
      return (patchCount === 1); // TBD: remove 'any' type when patch type gets fixed
    });
  }

  modifyAndGet(personID: number, mods: Partial<PersonSpec>) {
    return this.Model.query().patchAndFetchById(personID, mods);
  }

  // TBD: move the following to base class if can't get type enforcement

  // Patch a person and upsert its relations.
  modifyGraph(personID: number, graph: Partial<PersonModel>, allow = '*') {
    // Make sure the person has the correct id because `upsertGraph` uses the id fields
    // to determine which models need to be updated and which inserted.
    graph.id! = personID;

    // It's a good idea to wrap `upsertGraph` call in a transaction since it
    // may create multiple queries.
    return this.transaction(trx => { // TBD: revisit this: it has type any
      return (
        this.Model.query(trx)
          // For security reasons, limit the relations that can be upserted.
          .allowUpsert(allow)
          .upsertGraph(graph)
      );
    });
  }

  storeGraph(graph: PersonModel, allow: string = '*') {
    // It's a good idea to wrap `insertGraph` call in a transaction since it
    // may create multiple queries.
    return this.transaction(trx => { // TBD: revisit this: it has type any
      return (
        this.Model.query(trx)
          // For security reasons, limit the relations that can be inserted.
          .allowInsert(allow)
          .insertGraph(graph)
      );
    });
  }
}
