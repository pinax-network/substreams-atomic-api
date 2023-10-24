import { makeQuery } from "../clickhouse/makeQuery.js";
import { logger } from "../logger.js";
import { DEFAULT_SORT_BY, config } from '../config';
import * as prometheus from "../prometheus.js";

export default async function (req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    logger.info({searchParams: Object.fromEntries(Array.from(searchParams))});
    const collection_name = searchParams.get("collection_name");
    const query = `SELECT sum(listing_price) FROM ${config.table} WHERE collection_name = '${collection_name}'`;
    const response = await makeQuery(query)
    return new Response(JSON.stringify(response.data), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    logger.error(e);
    prometheus.request_error.inc({pathname: "/totalvolume", status: 400});
    return new Response(e.message, { status: 400 });
  }
}

