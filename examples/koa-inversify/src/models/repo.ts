
export interface RepoObject {
    readonly id: number;
}

export interface StampedRepoObject extends RepoObject {
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface Repo<O extends RepoObject> {
    // Including ...args allows subclasses to override with additional arguments
    store(obj: O, ...args: any[]): Promise<void>;
}

export interface StampedRepo<O extends StampedRepoObject> extends Repo<O>
{
    // Including ...args allows subclasses to override with additional arguments
    store(obj: O, ...args: any[]): Promise<void>;
}

export class ObjectNotFoundError extends Error {
    statusCode = 404;

    constructor(objectName: string, objectID: number) {
        super(`${objectName} not found (ID ${objectID})`);
    }
}
