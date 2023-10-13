import { Hono } from 'hono'

import { HTTPException } from 'hono/http-exception';

import config from './config';
import { banner } from "./banner";
import { salesCountQuery, totalVolumeQuery } from "./queries";

const app = new Hono()

app.get('/', (c) => c.text(banner()));

app.get('/health', async (c) => {
    const start = performance.now();
    const dbStatus = await fetch(`${config.DB_HOST}/ping`).then(async (r) => {
        return Response.json({
            db_status: await r.text(),
            db_response_time_ms: performance.now() - start
        }, r);
    }).catch((error) => {
        return Response.json({
            db_status: error.code,
            db_response_time_ms: performance.now() - start
        }, { status: 503 });
    });

    c.status(dbStatus.status);
    return c.json(await dbStatus.json());
});

app.get('/salescount', async (c) => {
    let collection_name = c.req.query('collection_name'); 

    if (!collection_name || typeof collection_name !== 'string')
        throw new HTTPException(400, {
            message: `The collection name is missing or is not valid.`
        });

    return c.json(await salesCountQuery(collection_name));
});

app.get('/totalvolume', async (c) => {
    let collection_name = c.req.query('collection_name'); 

    if (!collection_name || typeof collection_name !== 'string')
        throw new HTTPException(400, {
            message: `The collection name is missing or is not valid.`
        });

    return c.json(await totalVolumeQuery(collection_name));
});

app.onError((err, c) => {
    let error_message = `${err}`;
    let error_code = 500;

    if (err instanceof HTTPException){
        error_message = err.message;
        error_code = err.status;
    }

    return c.json({ message: error_message }, error_code);
});

export default app
