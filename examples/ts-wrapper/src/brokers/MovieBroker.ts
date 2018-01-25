import {Broker, BrokerObject, EagerRelation} from '../wrapper/Broker';
import {Person} from './PersonBroker';

export interface MovieSpec {
  name: string;
}

export interface Movie extends BrokerObject, MovieSpec {
  // Optional eager relations. This declaration is only necessary if a broker
  // exposes eager graphs requiring the declaration through the broker's API.
  actors?: EagerRelation<Person>[];
}

export interface MovieBroker extends Broker<Movie> {
  create(movieInfo: MovieSpec): Movie;
  addActor(movieID: number, actorID: number): Promise<Person>;
  getActors(movieID: number): Promise<Person[]>;
  get(movieID: number): Promise<Movie | undefined>; // TBD: is undefined possible?
}
