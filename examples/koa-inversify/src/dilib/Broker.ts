
export interface BrokerObject {
    readonly id: number;
}

export interface Broker<O extends BrokerObject> {
    // Including ...args allows subclasses to override with additional arguments
    store(obj: O, ...args: any[]): Promise<void>;
}

export class ObjectNotFoundError extends Error {
    statusCode = 404;

    constructor(objectName: string, objectID: number) {
        super(`${objectName} not found (ID ${objectID})`);
    }
}
