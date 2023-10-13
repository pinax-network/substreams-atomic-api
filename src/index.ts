import { Hono } from 'hono'

import { HTTPException } from 'hono/http-exception';

import config from './config';
import { banner } from "./banner";
import { salesCountQuery } from "./queries";

const app = new Hono()

app.get('/', (c) => c.text(banner()));

app.get('/salescount', async (c) => {
    let collection_name = c.req.query('collection_name'); 

    if (!(collection_name)) // TODO: Look into Validation (https://hono.dev/guides/validation)
        throw new HTTPException(400, {
            message: `The collection name is missing or is not valid.`
        });

    return c.json(await salesCountQuery(collection_name));
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
