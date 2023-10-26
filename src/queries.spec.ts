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
        .toBe(`SELECT * FROM Sales WHERE (collection_name == '${collection_name}') ORDER BY sale_id DESC LIMIT 1`);

    expect(getSale(new URLSearchParams({collection_name, greater_or_equals_by_listing_price_amount: '15', limit: '10'})))
        .toBe(`SELECT * FROM Sales WHERE (listing_price_amount >= 15 AND collection_name == '${collection_name}') ORDER BY sale_id DESC LIMIT 10`);
});