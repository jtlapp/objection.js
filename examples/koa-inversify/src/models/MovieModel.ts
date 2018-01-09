import * as Objection from 'objection';
import {Person, PersonModel} from './PersonModel';
import {Repo, RepoObject, ObjectNotFoundError} from './repo';
import {Model, ModelRepo} from './modelrepo';

export interface MovieInfo {
  name: string;
}

export interface Movie extends RepoObject, MovieInfo {
  // Optional eager relations.
  actors?: Person[];
}

export interface MovieRepo extends Repo<Movie> {
  // TBD
}

export class MovieModel extends Model implements MovieInfo {
  name: string;

  // Optional eager relations.
  actors?: PersonModel[];

  // Table name is the only required property.
  static tableName = 'Movie';

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static jsonSchema = {
    type: 'object',
    required: ['name'],

    properties: {
      id: {type: 'integer'},
      name: {type: 'string', minLength: 1, maxLength: 255}
    }
  };

  // This relationMappings is a thunk, which prevents require loops:
  static relationMappings = () => ({
    actors: {
      relation: Objection.Model.ManyToManyRelation,
      // The related model. This can be either a Model subclass constructor or an
      // absolute file path to a module that exports one. We use the file path version
      // here to prevent require loops.
      modelClass: PersonModel,
      join: {
        from: 'Movie.id',
        // ManyToMany relation needs the `through` object to describe the join table.
        through: {
          from: 'Person_Movie.movieId',
          to: 'Person_Movie.personId'
        },
        to: 'Person.id'
      }
    }
  });
}

export class MovieModelRepo extends ModelRepo<MovieModel> implements MovieRepo 
{
  create(movieInfo: MovieInfo) {
    // returns an instance; throws Objection.ValidationError
    return this.Model.fromJson(movieInfo);
  }

  addActor(movieID: number, actorID: number) {
    return this.Model.query().findById(movieID)
      .then(movie => {

        if (!movie) {
          throw new ObjectNotFoundError('movie', movieID);
        }
        return movie.$relatedQuery('actors').relate(actorID);
      });
  }

  getActors(movieID: number) {
    return this.Model.query().findById(movieID)
      .then(movie => {

        if (!movie) {
          throw new ObjectNotFoundError('movie', movieID);
        }
        return movie.$relatedQuery('actors');
      });
  }

  get(movieID: number) {
    return this.Model.query().findById(movieID);
  }
}

export default MovieModel;
