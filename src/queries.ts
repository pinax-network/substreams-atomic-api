import { z } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';

import config from './config'
import { SalesCountQueryResponseSchema, TotalVolumeQueryResponseSchema } from './schemas';

// Describe the default returned data format `JSONObjectEachRow` from the Clickhouse DB
type JSONObjectEachRow = {
    [key: string]: {
        [key: string]: string
    }
};

async function makeQuery(query: string, format: string = 'JSONObjectEachRow'): Promise<any> {
    const response = await fetch(`${config.dbHost}/?default_format=${format}`, {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
    }).catch((error) => {
        throw new HTTPException(503, {
            message: `(${error.path}) ${error} -- Check /health for API status.`
        });
    });

    const body = await response.text();
    let json;

    try {
        json = JSON.parse(body);
    } catch {
        throw new HTTPException(500, {
            message: `Error parsing JSON from DB response: ${body} -- Check /health for API status.`
        });
    }

    return json;
}


export async function salesCountQuery(collection_name: string): Promise<SalesCountQueryResponseSchema> {
    const query = `SELECT COUNT(sale_id) FROM ${config.name} WHERE (collection_name == '${collection_name}')`;
    const json = await makeQuery(query);

    return SalesCountQueryResponseSchema.parse({
        collection_name: collection_name,
        sales_count: Object.values(json as JSONObjectEachRow)[0]["count(sale_id)"]
    });
}

export async function totalVolumeQuery(collection_name: string) {
    const query = `SELECT SUM(listing_price) FROM ${config.name} WHERE (collection_name == '${collection_name}')`;
    const json = await makeQuery(query);

    return TotalVolumeQueryResponseSchema.parse({
        collection_name: collection_name,
        total_volume: Object.values(json as JSONObjectEachRow)[0]["sum(listing_price)"]
    });
}