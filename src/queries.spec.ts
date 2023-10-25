// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/queries.spec.ts

import { expect, test } from "bun:test";
import { getSalesCount } from "./queries.js";

const collection_name = "pomelo";

test("getSalesCount", () => {
    expect(getSalesCount(new URLSearchParams({collection_name})))
        .toBe(`SELECT count(sale_id) FROM Sales WHERE collection_name = '${collection_name}'`);
});