import {StampedResource, StampedResourceObject} from '../dilib/StampedResource';
import {Animal} from './AnimalResource';
import {Movie} from './MovieResource';

export interface PersonInfo {
  parentId: number | null;
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

export interface Person extends StampedResourceObject, PersonInfo {
  // Optional eager relations.
  parent?: Person;
  children?: Person[];
  pets?: Animal[];
  movies?: Movie[];
}
export interface PersonResource extends StampedResource<Person> {
  // TBD
}
