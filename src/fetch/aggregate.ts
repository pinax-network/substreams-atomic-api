import { makeQuery } from "../clickhouse/makeQuery.js";
import { logger } from "../logger.js";
import { getAggregate } from "../queries.js";
import * as prometheus from "../prometheus.js";

export default async function (req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    logger.info({searchParams: Object.fromEntries(Array.from(searchParams))});
    const query = await getAggregate(searchParams);
    const response = await makeQuery<number>(query)
    return new Response(JSON.stringify(response.data), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    logger.error(e);
    prometheus.request_error.inc({pathname: "/sales/aggregate", status: 400});
    return new Response(e.message, { status: 400 });
  }
}