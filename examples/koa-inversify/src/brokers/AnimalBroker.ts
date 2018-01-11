import {Person} from './PersonBroker';
import {Broker, BrokerObject} from '../dilib/Broker';

export interface AnimalSpec {
  ownerId: number | null; // TBD: should this be optional?
  name: string;
  species: string;
}

export interface Animal extends BrokerObject, AnimalSpec {
  // Optional eager relations.
  owner?: Person;
}

export interface AnimalBroker extends Broker<Animal> {
  create(animalInfo: AnimalSpec): Animal;
  get(animalID: number): Promise<Animal | undefined>;
}
