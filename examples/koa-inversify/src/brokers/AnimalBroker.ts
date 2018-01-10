import {Person} from './PersonBroker';
import {Broker, BrokerObject} from '../dilib/Broker';

export interface AnimalSpec { // TBD: app-sourced; props app can set
  ownerId: number | null;
  name: string;
  species: string;
}

export interface Animal extends BrokerObject, AnimalSpec { // TBD: repo-sourced; props repo sets
  // Optional eager relations.
  owner?: Person;
}

export interface AnimalBroker extends Broker<Animal> { // TBD: repo abstraction
  // TBD
}
