import {Resource, ResourceObject} from './resource';

export interface StampedResourceObject extends ResourceObject {
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface StampedResource<O extends StampedResourceObject> extends Resource<O>
{
    // Including ...args allows subclasses to override with additional arguments
    store(obj: O, ...args: any[]): Promise<void>;
}
