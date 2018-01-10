import {Person} from './PersonResource';
import {Resource, ResourceObject } from '../dilib/Resource';

export interface MovieInfo {
  name: string;
}

export interface Movie extends ResourceObject, MovieInfo {
  // Optional eager relations.
  actors?: Person[];
}

export interface MovieResource extends Resource<Movie> {
  // TBD
}
