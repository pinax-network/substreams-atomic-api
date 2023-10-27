import { DEFAULT_SORT_BY, config } from './config.js';
import { parseBlockId, parseLimit, parseTimestamp } from './utils.js';

export interface Sale {
    collection_name: string,
    sale_id: number,
    timestamp: string,
    block_number: number,
    listing_price_amount: number,
    listing_price_symcode: string,
    trx_id: string,
    asset_ids: number[],
}

export function getSale(searchParams: URLSearchParams) {
    // SQL Query
    let query = `SELECT * FROM Sales`;
    const where = [];

    // Clickhouse Operators
    // https://clickhouse.com/docs/en/sql-reference/operators
    const operators = [
        ["greater_or_equals", ">="],
        ["greater", ">"],
        ["less_or_equals", "<="],
        ["less", "<"],
    ]
    for ( const [key, operator] of operators ) {
        const block_number = searchParams.get(`${key}_by_block_number`);
        const timestamp = parseTimestamp(searchParams.get(`${key}_by_timestamp`));
        const listing_price_amount = searchParams.get(`${key}_by_listing_price_amount`);
        if (block_number) where.push(`block_number ${operator} ${block_number}`);
        if (timestamp) where.push(`toUnixTimestamp(timestamp) ${operator} ${timestamp}`);
        if (listing_price_amount) where.push(`listing_price_amount ${operator} ${listing_price_amount}`);
    }

    // contains asset_id
    const asset_id_in_asset_ids = searchParams.get("asset_id_in_asset_ids");
    if (asset_id_in_asset_ids) where.push(`has(asset_ids, ${asset_id_in_asset_ids})`)

    // equals
    const collection_name = searchParams.get("collection_name");
    const sale_id = searchParams.get("sale_id");
    const block_number = searchParams.get('block_number');
    const timestamp = parseTimestamp(searchParams.get('timestamp'));
    const listing_price_amount = searchParams.get('listing_price_amount');
    const listing_price_symcode = searchParams.get('listing_price_symcode');
    const trx_id = searchParams.get('trx_id');
    const asset_ids = searchParams.get('asset_ids'); 
    if (collection_name) where.push(`collection_name == '${collection_name}'`);
    if (sale_id) where.push(`sale_id == '${sale_id}'`);
    if (block_number) where.push(`block_number == '${block_number}'`);
    if (timestamp) where.push(`toUnixTimestamp(timestamp) == ${timestamp}`);
    if (listing_price_amount) where.push(`listing_price_amount == ${listing_price_amount}`);
    if (listing_price_symcode) where.push(`listing_price_symcode == '${listing_price_symcode}'`);
    if (trx_id) where.push(`trx_id == '${trx_id}'`);
    if (asset_ids) where.push(`asset_ids == '${asset_ids}'`);

    // Join WHERE statements with AND
    if ( where.length ) query += ` WHERE (${where.join(' AND ')})`;

    // Sort and Limit
    const limit = parseLimit(searchParams.get("limit"));
    const sort_by = searchParams.get("sort_by");
    query += ` ORDER BY sale_id ${sort_by ?? DEFAULT_SORT_BY}`
    query += ` LIMIT ${limit}`
    return query;
}

export function getSalesCount(searchParams: URLSearchParams) {
    // Params
    const collection_name = searchParams.get("collection_name");
    const query = `SELECT count(sale_id) FROM Sales WHERE collection_name = '${collection_name}'`
    return query;
}