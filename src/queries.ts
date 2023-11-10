import { DEFAULT_SORT_BY, config } from './config.js';
import { parseCollectionName, parseChain, parseTimestamp, parsePositiveInt, parseListingPriceSymcode,
     parseTransactionId, parseLimit, parseSortBy, parseAggregateFunction, parseAggregateColumn } from './utils.js';

export interface Sale {
    sale_id: number,
    trx_id: string,
    asset_ids: number[],
    listing_price_amount: number,
    listing_price_precision: number,
    listing_price_symcode: string,
    collection_name: string,
    template_id: number,
    block_number: number,
    timestamp: string,
    chain: string
}

export function getSale(searchParams: URLSearchParams) {
    // SQL Query
    let query = `SELECT sale_id, trx_id, asset_ids, listing_price_amount, listing_price_precision, listing_price_symcode,
s.collection_name as collection_name, template_id, block_number, timestamp, s.chain as chain FROM`;
    
    // explode asset_ids array (useful for bundle sales)
    query += ` (SELECT * FROM Sales ARRAY JOIN asset_ids) AS s`;
    // JOIN assets table where Assets.asset_id is in Sales.asset_ids
    query += `\nJOIN Assets AS a ON a.asset_id = s.asset_ids AND a.collection_name = s.collection_name`;


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
        const block_number = parsePositiveInt(searchParams.get(`${key}_by_block_number`));
        const timestamp = parseTimestamp(searchParams.get(`${key}_by_timestamp`));
        const listing_price_amount = parsePositiveInt(searchParams.get(`${key}_by_listing_price_amount`));
        if (block_number) where.push(`block_number ${operator} ${block_number}`);
        if (timestamp) where.push(`toUnixTimestamp(timestamp) ${operator} ${timestamp}`);
        if (listing_price_amount) where.push(`listing_price_amount ${operator} ${listing_price_amount}`);
    }

    // contains asset_id
    const contains_asset_id = parsePositiveInt(searchParams.get("contains_asset_id"));
    if (contains_asset_id) where.push(`asset_ids == ${contains_asset_id}`)

    // equals
    const collection_name = parseCollectionName(searchParams.get('collection_name'));
    if (collection_name) where.push(`collection_name == '${collection_name}'`);

    const sale_id = parsePositiveInt(searchParams.get('sale_id'));
    if (sale_id) where.push(`sale_id == '${sale_id}'`);

    const block_number = parsePositiveInt(searchParams.get('block_number'));
    if (block_number) where.push(`block_number == '${block_number}'`);

    const timestamp = parseTimestamp(searchParams.get('timestamp'));
    if (timestamp) where.push(`toUnixTimestamp(timestamp) == ${timestamp}`);

    const listing_price_amount = parsePositiveInt(searchParams.get('listing_price_amount'));
    if (listing_price_amount) where.push(`listing_price_amount == ${listing_price_amount}`);

    const listing_price_symcode = parseListingPriceSymcode(searchParams.get('listing_price_symcode'));
    if (listing_price_symcode) where.push(`listing_price_symcode == '${listing_price_symcode}'`);

    const trx_id = parseTransactionId(searchParams.get('trx_id'));
    if (trx_id) where.push(`trx_id == '${trx_id}'`);

    const template_id = parsePositiveInt(searchParams.get('template_id'));
    if (template_id) where.push(`template_id == '${template_id}'`);

    const chain = parseChain(searchParams.get('chain'));
    if (chain) where.push(`chain == '${chain}'`);

    // Join WHERE statements with AND
    if ( where.length ) query += ` WHERE (${where.join(' AND ')})`;

    // Sort and Limit
    const limit = parseLimit(searchParams.get("limit"));
    const sort_by = parseSortBy(searchParams.get("sort_by"));
    query += ` ORDER BY sale_id ${sort_by ?? DEFAULT_SORT_BY}`
    query += ` LIMIT ${limit}`
    return query;
}

export function getAggregate(searchParams: URLSearchParams) {
    // SQL Query
    let query = `SELECT`;

    // Aggregate Function
    const aggregate_function = parseAggregateFunction(searchParams.get("aggregate_function"));

    // Aggregate Column
    const aggregate_column = parseAggregateColumn(searchParams.get("aggregate_column"));

    // Listing Price Symcode
    const listing_price_symcode = parseListingPriceSymcode(searchParams.get('listing_price_symcode'));

    if (aggregate_function == "count"  && aggregate_column != "total_asset_ids")  {
        if (aggregate_column) query += ` count(${aggregate_column})`;
        else query += ` count()`;
    }

    // for total asset ids we need a subquery
    else if (aggregate_column == "total_asset_ids") query += ` ${aggregate_function}(${aggregate_column}) FROM (SELECT length(asset_ids) AS total_asset_ids`;
    else if (aggregate_column == "listing_price_amount" &&  (listing_price_symcode)) query += ` ${aggregate_function}(${aggregate_column})`
    else if (aggregate_column == "listing_price_amount" &&  !(listing_price_symcode)) throw new Error("Please specify a Symbol Code");
    else throw new Error("Invalid aggregate column with given aggregate function");

    query += ` FROM Sales`;

    // close the subquery if needed
    if (aggregate_column == "total_asset_ids") query += `)`;

    // alias needed for subqueries so we include it all the time
    query += ` AS s`;

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
        const block_number = parsePositiveInt(searchParams.get(`${key}_by_block_number`));
        const timestamp = parseTimestamp(searchParams.get(`${key}_by_timestamp`));
        if (block_number) where.push(`block_number ${operator} ${block_number}`);
        if (timestamp) where.push(`toUnixTimestamp(timestamp) ${operator} ${timestamp}`);
    }

    // equals
    const collection_name = parseCollectionName(searchParams.get('collection_name'));
    if (collection_name) where.push(`collection_name == '${collection_name}'`);

    const block_number = parsePositiveInt(searchParams.get('block_number'));
    if (block_number) where.push(`block_number == '${block_number}'`);

    const timestamp = parseTimestamp(searchParams.get('timestamp'));
    if (timestamp) where.push(`toUnixTimestamp(timestamp) == ${timestamp}`);

    if (listing_price_symcode) where.push(`listing_price_symcode == '${listing_price_symcode}'`);

    const chain = parseChain(searchParams.get('chain'));
    if (chain) where.push(`chain == '${chain}'`);

    // Join WHERE statements with AND
    if ( where.length ) query += ` WHERE (${where.join(' AND ')})`;

    return query;
}