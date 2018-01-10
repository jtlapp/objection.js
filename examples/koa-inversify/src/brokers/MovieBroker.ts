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
  // TBD
}
