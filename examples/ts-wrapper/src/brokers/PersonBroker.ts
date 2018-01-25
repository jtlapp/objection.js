import {EagerRelation} from '../wrapper/Broker';
import {StampedBroker, StampedBrokerObject} from '../wrapper/StampedBroker';
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
  // Optional eager relations. These declarations are only necessary if a broker
  // exposes eager graphs requiring them through its API.
  parent?: EagerRelation<Person>;
  children?: EagerRelation<Person>[];
  pets?: EagerRelation<Animal>[];
  movies?: EagerRelation<Movie>[];
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
  get(personID: number): Promise<Person | undefined>;
  // TBD: should the following return an EagerRelation<Person>[]?
  getGraph(eager: string, allow: string, filter: PersonFilter): Promise<Partial<Person>[]>;
  getPets(personID: number, filter: PetFilter): Promise<Animal[]>;
  getMovies(personID: number): Promise<Movie[]>;
  modify(personID: number, mods: Partial<PersonSpec>): Promise<boolean>;
  modifyAndGet(personID: number, mods: Partial<PersonSpec>): Promise<Person>;
  // TBD: should the following take an EagerRelation<Person>?
  modifyGraph(personID: number, graph: Partial<Person>, allow: string): Promise<Person>;
  // TBD: should the following take an EagerRelation<Person>?
  storeGraph(graph: Person, allow: string): Promise<Person>;
}
