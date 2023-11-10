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
    expect(getAggregate(new URLSearchParams({aggregate_function: 'count', collection_name})))
        .toBe(`SELECT count() FROM Sales AS s WHERE (collection_name == '${collection_name}')`);

    expect(getAggregate(new URLSearchParams({aggregate_function: 'count', aggregate_column: 'sale_id'})))
        .toBe(`SELECT count(sale_id) FROM Sales AS s`);

    expect(getAggregate(new URLSearchParams({aggregate_function: 'max', aggregate_column: 'listing_price_amount', listing_price_symcode: 'EOS'})))
        .toBe(`SELECT max(listing_price_amount) FROM Sales AS s WHERE (listing_price_symcode == 'EOS')`);
    
    expect(getAggregate(new URLSearchParams({aggregate_function: 'max', aggregate_column: 'total_asset_ids'})))
        .toBe(`SELECT max(total_asset_ids) FROM (SELECT length(asset_ids) AS total_asset_ids FROM Sales) AS s`);
});