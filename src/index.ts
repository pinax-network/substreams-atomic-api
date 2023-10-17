import { OpenAPIHono } from '@hono/zod-openapi';
import { serveStatic } from 'hono/bun';
import { TypedResponse } from 'hono';
import { HTTPException } from 'hono/http-exception';

import * as routes from './routes';
import config from './config';
import pkg from '../package.json';
import * as schemas from './schemas';
import { banner } from "./banner";
import { salesCountQuery, totalVolumeQuery } from "./queries";

// Export app as a function to be able to create it in tests as well.
// Default export is different for setting Bun port/hostname than running tests.
// See (https://hono.dev/getting-started/bun#change-port-number) vs. (https://hono.dev/getting-started/bun#_3-hello-world)
export function generateApp() {
    const app = new OpenAPIHono();

    app.use('/swagger/*', serveStatic({ root: './' }));

    app.doc('/openapi', {
        openapi: '3.0.0',
        info: {
            version: pkg.version,
            title: 'Atomicmarket Sales API',
        },
    });

    app.onError((err, c) => {
        let error_message = `${err}`;
        let error_code = 500;

        if (err instanceof HTTPException){
            error_message = err.message;
            error_code = err.status;
        }

        return c.json({ error_message }, error_code);
    });

    app.openapi(routes.indexRoute, (c) => {
        return {
            response: c.text(banner())
        } as TypedResponse<string>;
    });

    app.openapi(routes.healthCheckRoute, async (c) => {
        type DBStatusResponse = {
            db_status: string,
            db_response_time_ms: number
        };

        const start = performance.now();
        const dbStatus = await fetch(`${config.dbHost}/ping`).then(async (r) => {
            return Response.json({
                db_status: await r.text(),
                db_response_time_ms: performance.now() - start
            } as DBStatusResponse, r);
        }).catch((error) => {
            return Response.json({
                db_status: error.code,
                db_response_time_ms: performance.now() - start
            } as DBStatusResponse, { status: 503 });
        });

        c.status(dbStatus.status);
        return {
            response: c.json(await dbStatus.json())
        } as TypedResponse<DBStatusResponse>;
    });

    app.openapi(routes.salesCountQueryRoute, async (c) => {
        const { collection_name } = c.req.valid('query') as schemas.CollectionNameSchema;

        return {
            response: c.json(await salesCountQuery(collection_name))
        } as TypedResponse<schemas.SalesCountQueryResponseSchema>;
    });

    app.openapi(routes.totalVolumeQueryRoute, async (c) => {
        const { collection_name } = c.req.valid('query') as schemas.CollectionNameSchema;

        return {
            response: c.json(await totalVolumeQuery(collection_name))
        } as TypedResponse<schemas.TotalVolumeQueryResponseSchema>;
    });

    return app;
}

Bun.serve({
    port: config.port,
    hostname: config.hostname,
    fetch: generateApp().fetch
}
)