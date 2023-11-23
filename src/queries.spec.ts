// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/queries.spec.ts

import { expect, test } from "bun:test";
import { getSale, getAggregate } from "./queries.js";

const collection_name = "pomelo";
const chain = "eos";

test("getSale", () => {
    expect(getSale(new URLSearchParams({collection_name, chain})))
        .toBe(`SELECT sale_id, trx_id, asset_ids, listing_price_amount, listing_price_precision, listing_price_symcode,
s.collection_name as collection_name, template_id, block_number, timestamp, s.chain as chain FROM (SELECT * FROM Sales ARRAY JOIN asset_ids) AS s
JOIN Assets AS a ON a.asset_id = s.asset_ids AND a.collection_name = s.collection_name WHERE (collection_name == '${collection_name}' AND chain == '${chain}') ORDER BY sale_id DESC LIMIT 1`);

    expect(getSale(new URLSearchParams({contains_asset_id: '2199024044581'})))
    .toBe(`SELECT sale_id, trx_id, asset_ids, listing_price_amount, listing_price_precision, listing_price_symcode,
s.collection_name as collection_name, template_id, block_number, timestamp, s.chain as chain FROM (SELECT * FROM Sales ARRAY JOIN asset_ids) AS s
JOIN Assets AS a ON a.asset_id = s.asset_ids AND a.collection_name = s.collection_name WHERE (asset_ids == 2199024044581) ORDER BY sale_id DESC LIMIT 1`);
});

test("getAggregate", () => {
    const date_of_query = Math.floor(Number(new Date().setHours(0,0,0,0)) / 1000);
    const datetime_of_query = Math.floor(Number(new Date()) / 1000);
    expect(getAggregate(new URLSearchParams({aggregate_function: 'count', collection_name})))
        .toBe(`SELECT chain, listing_price_symcode as symbol_code, toUnixTimestamp(DATE(timestamp)) as timestamp, count() as value FROM Sales AS s WHERE (timestamp BETWEEN ${datetime_of_query} - 3600 * 24 AND ${datetime_of_query} AND collection_name == 'pomelo') GROUP BY chain, symbol_code, timestamp order by timestamp ASC`);


    expect(getAggregate(new URLSearchParams({aggregate_function: 'max', aggregate_column: 'listing_price_amount', range: '30d'})))
        .toBe(`SELECT chain, listing_price_symcode as symbol_code, toUnixTimestamp(DATE(timestamp)) as timestamp, max(listing_price_amount) as value FROM Sales AS s WHERE (timestamp BETWEEN ${date_of_query} - 86400 * 30 AND ${date_of_query}) GROUP BY chain, symbol_code, timestamp order by timestamp ASC`);
    
    expect(getAggregate(new URLSearchParams({aggregate_function: 'avg', aggregate_column: 'total_asset_ids'})))
        .toBe(`SELECT chain, listing_price_symcode as symbol_code, toUnixTimestamp(DATE(timestamp)) as timestamp, avg(total_asset_ids) as value FROM (SELECT chain, collection_name, listing_price_symcode, timestamp, block_number, length(asset_ids) AS total_asset_ids FROM Sales) AS s WHERE (timestamp BETWEEN ${datetime_of_query} - 3600 * 24 AND ${datetime_of_query}) GROUP BY chain, symbol_code, timestamp order by timestamp ASC`);
});