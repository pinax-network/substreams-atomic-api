// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/queries.spec.ts

import { expect, test } from "bun:test";
import { getSale, getAggregate } from "./queries.js";

const collection_name = "pomelo";
const aggregate_function = "min";
const aggregate_column = "listing_price_amount";

test("getSale", () => {
    expect(getSale(new URLSearchParams({collection_name})))
        .toBe(`SELECT sale_id, trx_id, asset_ids, listing_price_amount, listing_price_precision, listing_price_symcode,
s.collection_name as collection_name, template_id, block_number, timestamp FROM (SELECT * FROM Sales ARRAY JOIN asset_ids) AS s
JOIN Assets AS a ON a.asset_id = s.asset_ids AND a.collection_name = s.collection_name
JOIN blocks ON blocks.block_id = s.block_id WHERE (collection_name == '${collection_name}') ORDER BY sale_id DESC LIMIT 1`);
/*
    expect(getSale(new URLSearchParams({collection_name, greater_or_equals_by_listing_price_amount: '15', limit: '10'})))
        .toBe(`SELECT * FROM Sales JOIN blocks ON blocks.block_id = Sales.block_id WHERE (listing_price_amount >= 15 AND collection_name == '${collection_name}') ORDER BY sale_id DESC LIMIT 10`);

    expect(getSale(new URLSearchParams({asset_id_in_asset_ids: '2199024044581'})))
    .toBe(`SELECT * FROM Sales JOIN blocks ON blocks.block_id = Sales.block_id WHERE (has(asset_ids, 2199024044581)) ORDER BY sale_id DESC LIMIT 1`);*/
});

test("getAggregate", () => {
    expect(getAggregate(new URLSearchParams({aggregate_function, aggregate_column})))
        .toBe(`SELECT ${aggregate_function}(${aggregate_column}) FROM Sales`);
});