import * as Koa from 'koa';

export interface Deployment {
    config(app: Koa): void;
}
