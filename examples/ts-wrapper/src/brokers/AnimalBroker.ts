import {Broker, BrokerObject, EagerRelation} from '../wrapper/Broker';
import {Person} from './PersonBroker';

export interface AnimalSpec {
  ownerId: number | null; // TBD: should this be optional?
  name: string;
  species: string;
}

export interface Animal extends BrokerObject, AnimalSpec {
  // Optional eager relations. This declaration is only necessary if a broker
  // exposes eager graphs requiring the declaration through the broker's API.
  owner?: EagerRelation<Person>
}

export interface AnimalBroker extends Broker<Animal> {
  create(animalInfo: AnimalSpec): Animal;
  get(animalID: number): Promise<Animal | undefined>;
}
