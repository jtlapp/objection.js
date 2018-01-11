import {StampedBroker, StampedBrokerObject} from '../dilib/StampedBroker';
import {Animal} from './AnimalBroker';
import {Movie} from './MovieBroker';

export interface PersonSpec {
  parentId: number | null; // TBD: should this be optional?
  firstName: string;
  lastName: string;
  age: number;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  zipCode: string;
}

export interface Person extends StampedBrokerObject, PersonSpec {
  // Optional eager relations.
  parent?: Person;
  children?: Person[];
  pets?: Animal[];
  movies?: Movie[];
}
export interface PersonBroker extends StampedBroker<Person> {
  // TBD
}
