import {Person} from './PersonResource';
import {Resource, ResourceObject} from '../dilib/Resource';

export interface AnimalInfo { // TBD: app-sourced; props app can set
  ownerId: number | null;
  name: string;
  species: string;
}

export interface Animal extends ResourceObject, AnimalInfo { // TBD: repo-sourced; props repo sets
  // Optional eager relations.
  owner?: Person;
}

export interface AnimalResource extends Resource<Animal> { // TBD: repo abstraction
  // TBD
}
