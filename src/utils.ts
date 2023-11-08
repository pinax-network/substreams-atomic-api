import { z } from 'zod';
import { Name, Asset } from "@wharfkit/antelope";
import { DEFAULT_SORT_BY, DEFAULT_AGGREGATE_FUNCTION, config } from "./config.js";
import { logger } from './logger.js';

export function parseCollectionName(collection_name?: string|null) {
    if (!z.string().regex(Name.pattern).safeParse(collection_name).success) {
        return undefined;
    }

    return collection_name;
}

export function parsePositiveInt(number?: string|null|number) {
    let value = undefined;
    if (number) {
        if (typeof number === "string") value = parseInt(number);
        if (typeof number === "number") value = number;
    }
    // Must be non-negative number
    if ( value && value <= 0 ) value = undefined;
    return value;
}

export function parseListingPriceSymcode(listing_price_symcode?: string|null) {
    if (!z.string().regex(Asset.Symbol.symbolNamePattern).safeParse(listing_price_symcode).success) {
        return undefined;
    }

    return listing_price_symcode;
}

export function parseTransactionId(trx_id?: string|null) {
    // Match against hexadecimal string (with or without '0x' prefix)
    if (!z.string().regex(/^(0x)?[a-fA-F0-9]+$/).safeParse(trx_id).success) {
        return undefined;
    }

    return trx_id ? trx_id.replace("0x", "") : undefined;
}

export function parseTimestamp(timestamp?: string|null|number) {
    if (timestamp !== undefined && timestamp !== null) {
        if (typeof timestamp === "string") {
            if (/^[0-9]+$/.test(timestamp)) {
                return parseTimestamp(parseInt(timestamp));
            }
            // append "Z" to timestamp if it doesn't have it
            if (!timestamp.endsWith("Z")) timestamp += "Z";
            return Math.floor(Number(new Date(timestamp)) / 1000);
        }
        if (typeof timestamp === "number") {
            const length = timestamp.toString().length;
            if ( length === 10 ) return timestamp; // seconds
            if ( length === 13 ) return Math.floor(timestamp / 1000); // convert milliseconds to seconds
            throw new Error("Invalid timestamp");
        }
    }
    return undefined;
}

export function parseLimit(limit?: string|null|number) {
    let value = 1; // default 1
    if (limit) {
        if (typeof limit === "string") value = parseInt(limit);
        if (typeof limit === "number") value = limit;
    }
    // limit must be between 1 and maxLimit
    if (value <= 0) value = 1;
    if ( value > config.maxLimit ) value = config.maxLimit;
    return value;
}

export function parseSortBy(sort_by?: string|null) {
    if (!z.enum(["ASC", "DESC"]).safeParse(sort_by).success) {
        return DEFAULT_SORT_BY;
    }

    return sort_by;
}

export function parseAggregateFunction(aggregate_function?: string|null) {
    if (!z.enum(["min", "max", "avg", "sum", "count", "median"]).safeParse(aggregate_function).success) {
        logger.info("Aggregate function not supported, using default");    
        return DEFAULT_AGGREGATE_FUNCTION;
    }

    return aggregate_function;
}

export function parseAggregateColumn(aggregate_column?: string|null) {
    if (!z.enum(["sale_id", "total_asset_ids", "listing_price_amount", "listing_price_value"]).safeParse(aggregate_column).success) {
        return undefined;
    }
    return aggregate_column;
}