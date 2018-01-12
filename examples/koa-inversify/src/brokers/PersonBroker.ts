import {StampedBroker, StampedBrokerObject} from '../dilib/StampedBroker';
import {AnimalSpec, Animal} from './AnimalBroker';
import {MovieSpec, Movie} from './MovieBroker';

export type PersonFilter = {minAge?: number, maxAge?: number, firstName?: string};
export type PetFilter = {name?: string, species?: string};

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
  create(personInfo: PersonSpec): Person;
  addChild(personID: number, child: PersonSpec): Promise<Person>;
  addChildren(personID: number, children: PersonSpec[]): Promise<Person[]>;
  addMovie(personID: number, movie: MovieSpec): Promise<Movie>;
  addMovies(personID: number, movies: MovieSpec[]): Promise<Movie[]>;
  addPet(personID: number, pets: AnimalSpec): Promise<Animal>;
  addPets(personID: number, pets: AnimalSpec[]): Promise<Animal[]>;
  drop(personID: number): Promise<boolean>;
  get(personID: number): Promise<Person | undefined>; // TBD: is undefined possible?
  getGraph(eager: string, allow: string, filter: PersonFilter): Promise<Person[]>;
  getPets(personID: number, filter: PetFilter): Promise<Animal[]>;
  getMovies(personID: number): Promise<Movie[]>;
  modify(personID: number, mods: Partial<PersonSpec>): Promise<boolean>;
  modifyAndGet(personID: number, mods: Partial<PersonSpec>): Promise<Person>;
  // modifyGraph(personID: number, graph: /*TBD*/any, allow = '*');
  // storeGraph(graph: /*TBD*/any, allow: string = '*');
}
