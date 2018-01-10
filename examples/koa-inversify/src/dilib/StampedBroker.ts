import {Broker, BrokerObject} from './broker';

export interface StampedBrokerObject extends BrokerObject {
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface StampedBroker<O extends StampedBrokerObject> extends Broker<O>
{
    // Including ...args allows subclasses to override with additional arguments
    store(obj: O, ...args: any[]): Promise<void>;
}
