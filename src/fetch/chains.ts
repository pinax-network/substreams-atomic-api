import { logger } from "../logger.js";
import { store } from "../clickhouse/stores.js";
import * as prometheus from "../prometheus.js";
import { BadRequest, toJSON } from "./cors.js";

export default async function () {
  try {
    const chains = await store.chains;
    return toJSON(chains);
  } catch (e: any) {
    logger.error(e);
    prometheus.request_error.inc({pathname: "/chains", status: 400});
    return BadRequest
  }
} 
