import { logger } from "../logger.js";
import * as prometheus from "../prometheus.js";
import client from "./createClient.js";

export interface Meta {
    name: string,
    type: string
}
export interface Query {
    meta: Meta[],
    data: string,
    rows: number,
    statistics: {
        elapsed: number,
        rows_read: number,
        bytes_read: number,
    }
}

export async function makeQuery(query: string) {
    const response = await client.query({ query })
    const data: Query = await response.json();
    prometheus.query.inc();
    prometheus.bytes_read.inc(data.statistics.bytes_read);
    prometheus.rows_read.inc(data.statistics.rows_read);
    prometheus.elapsed.inc(data.statistics.elapsed);
    logger.info({ query, statistics: data.statistics, rows: data.rows });
    return data;
}
