import {Person} from './PersonBroker';
import {Broker, BrokerObject } from '../dilib/Broker';

export interface MovieSpec {
  name: string;
}

export interface Movie extends BrokerObject, MovieSpec {
  // Optional eager relations.
  actors?: Person[];
}

export interface MovieBroker extends Broker<Movie> {
  create(movieInfo: MovieSpec): Movie;
  //addActor(movieID: number, actorID: number); // TBD: output of QB.relate() is in flux
  getActors(movieID: number): Promise<Person[]>;
  get(movieID: number): Promise<Movie | undefined>; // TBD: is undefined possible?
}
