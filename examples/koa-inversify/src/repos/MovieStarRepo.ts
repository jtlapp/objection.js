import {PersonBroker} from '../brokers/PersonBroker';
import {AnimalBroker} from '../brokers/AnimalBroker';
import {MovieBroker} from '../brokers/MovieBroker';

export interface MovieStarRepo {
    personBroker: PersonBroker;
    animalBroker: AnimalBroker;
    movieBroker: MovieBroker;
}
