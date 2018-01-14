
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

// This type is only useful for defining eager relations in graphs that use
// model references. Placing it here makes it available to brokers that expose
// graphs through their APis. If brokers only use graphs internally, it can be
// moved to models/BrokerModel.ts and changed to have T extend BrokerModel.
// When model references aren't needed, define eager relations as Partial<T>.
export type EagerRelation<T extends BrokerObject> = Partial<T> & {
  // Objection allows you to override these default model reference property
  // names, so declare those actually in use.
  '#id'?: string,
  '#ref'?: string,
  '#dbRef'?: number
};
