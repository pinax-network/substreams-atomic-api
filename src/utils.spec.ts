import { expect, test } from "bun:test";
import { parseCollectionName, parseChain, parsePositiveInt, parseListingPriceSymcode, parseTransactionId,
     parseLimit, parseTimestamp, parseAggregateFunction, parseAggregateColumn } from "./utils.js";
import { DEFAULT_MAX_LIMIT } from "./config.js";

test("parseCollectionName", () => {
    expect(parseCollectionName()).toBeUndefined();
    expect(parseCollectionName(null)).toBeUndefined();
    expect(parseCollectionName("pomelo")).toBe("pomelo");
    expect(parseCollectionName("222wombat222")).toBe("222wombat222");
});

test("parseChain", () => {
    expect(parseChain()).toBeUndefined();
    expect(parseChain(null)).toBeUndefined();
    expect(parseChain("eos")).toBe("eos");
    expect(parseChain("wax")).toBe("wax");
});

test("parsePositiveInt", () => {
    expect(parsePositiveInt()).toBeUndefined();
    expect(parsePositiveInt(null)).toBeUndefined();
    expect(parsePositiveInt(-1)).toBeUndefined();
    expect(parsePositiveInt("invalid")).toBeNaN();
    expect(parsePositiveInt("10")).toBe(10);
    expect(parsePositiveInt(10)).toBe(10);
});

test("parseListingPriceSymcode", () => {
    expect(parseListingPriceSymcode()).toBeUndefined();
    expect(parseListingPriceSymcode(null)).toBeUndefined();
    expect(parseListingPriceSymcode("invalid")).toBeUndefined();
    expect(parseListingPriceSymcode("EOS")).toBe("EOS");
    expect(parseListingPriceSymcode("USD")).toBe("USD");
});

test("parseTransactionID", () => {
    expect(parseTransactionId()).toBeUndefined();
    expect(parseTransactionId(null)).toBeUndefined();
    expect(parseTransactionId("invalid")).toBeUndefined();
    expect(parseTransactionId("174773c1b239a2189be75589a0f1cb483ce15280c0a3549c46f7388573baa3ca")).toBe("174773c1b239a2189be75589a0f1cb483ce15280c0a3549c46f7388573baa3ca");
    expect(parseTransactionId("0x00fef8cf2a2c73266f7c0b71fb5762f9a36419e51a7c05b0e82f9e3bacb859bc")).toBe("00fef8cf2a2c73266f7c0b71fb5762f9a36419e51a7c05b0e82f9e3bacb859bc");
});

test("parseLimit", () => {
    expect(parseLimit()).toBe(1);
    expect(parseLimit(null)).toBe(1);
    expect(parseLimit("10")).toBe(10);
    expect(parseLimit(10)).toBe(10);
    expect(parseLimit(999999)).toBe(DEFAULT_MAX_LIMIT);
});

test("parseTimestamp", () => {
    const seconds = 1672531200;
    expect(parseTimestamp()).toBeUndefined();
    expect(parseTimestamp(null)).toBeUndefined();
    expect(parseTimestamp(1672531200000)).toBe(seconds); // Milliseconds (13 digits) => Seconds (10 digits)
    expect(parseTimestamp("1672531200")).toBe(seconds);
    expect(parseTimestamp(1672531200000)).toBe(seconds);
    expect(parseTimestamp("2023-01-01T00:00:00.000Z")).toBe(seconds);
    expect(parseTimestamp("2023-01-01T00:00:00.000")).toBe(seconds);
    expect(parseTimestamp("2023-01-01 00:00:00")).toBe(seconds); // Datetime
    expect(parseTimestamp("2023-01-01T00:00:00Z")).toBe(seconds); // ISO
    expect(parseTimestamp("2023-01-01T00:00:00")).toBe(seconds);
    expect(parseTimestamp("2023-01-01")).toBe(seconds);
    expect(parseTimestamp("2023-01")).toBe(seconds);
    expect(parseTimestamp(Number(new Date("2023")))).toBe(seconds);

    // errors
    expect(() => parseTimestamp(10)).toThrow("Invalid timestamp");
    expect(() => parseTimestamp("10")).toThrow("Invalid timestamp");
});

test("parseAggregateFunction", () => {
    expect(parseAggregateFunction()).toBe("count");
    expect(parseAggregateFunction(null)).toBe("count");
    expect(parseAggregateFunction("invalid")).toBe("count");
    expect(parseAggregateFunction("count")).toBe("count");
    expect(parseAggregateFunction("sum")).toBe("sum");
    expect(parseAggregateFunction("avg")).toBe("avg");
    expect(parseAggregateFunction("min")).toBe("min");
    expect(parseAggregateFunction("max")).toBe("max");
});

test("parseAggregateColumn", () => {
    expect(parseAggregateColumn()).toBeUndefined();
    expect(parseAggregateColumn(null)).toBeUndefined();
    expect(parseAggregateColumn("invalid")).toBeUndefined();
    expect(parseAggregateColumn("sale_id")).toBe("sale_id");
    expect(parseAggregateColumn("listing_price_amount")).toBe("listing_price_amount");
    expect(parseAggregateColumn("listing_price_value")).toBe("listing_price_value");
    expect(parseAggregateColumn("total_asset_ids")).toBe("total_asset_ids");
});