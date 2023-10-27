// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/queries.spec.ts

import { expect, test } from "bun:test";
import { getSalesCount, getSale } from "./queries.js";

const collection_name = "pomelo";

test("getSalesCount", () => {
    expect(getSalesCount(new URLSearchParams({collection_name})))
        .toBe(`SELECT count(sale_id) FROM Sales WHERE collection_name = '${collection_name}'`);
});

test("getSale", () => {
    expect(getSale(new URLSearchParams({collection_name})))
        .toBe(`SELECT * FROM Sales JOIN blocks ON blocks.block_id = Sales.block_id WHERE (collection_name == '${collection_name}') ORDER BY sale_id DESC LIMIT 1`);

    expect(getSale(new URLSearchParams({collection_name, greater_or_equals_by_listing_price_amount: '15', limit: '10'})))
        .toBe(`SELECT * FROM Sales JOIN blocks ON blocks.block_id = Sales.block_id WHERE (listing_price_amount >= 15 AND collection_name == '${collection_name}') ORDER BY sale_id DESC LIMIT 10`);

    expect(getSale(new URLSearchParams({asset_id_in_asset_ids: '2199024044581'})))
    .toBe(`SELECT * FROM Sales JOIN blocks ON blocks.block_id = Sales.block_id WHERE (has(asset_ids, 2199024044581)) ORDER BY sale_id DESC LIMIT 1`);
});