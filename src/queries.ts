import { DEFAULT_SORT_BY, config } from './config.js';
import { parseCollectionName, parseTimestamp, parsePositiveInt, parseListingPriceValue, parseListingPriceSymcode,
     parseTransactionId, parseLimit, parseSortBy, parseAggregateFunction, parseAggregateColumn } from './utils.js';

export interface Sale {
    collection_name: string,
    sale_id: number,
    timestamp: string,
    block_number: number,
    listing_price_amount: number,
    listing_price_symcode: string,
    listing_price_value: number,
    trx_id: string,
    asset_ids: number[],
}

export function getSale(searchParams: URLSearchParams) {
    // SQL Query
    let query = `SELECT sale_id, trx_id, asset_ids, listing_price_amount, listing_price_precision, listing_price_symcode, listing_price_value,
s.collection_name as collection_name, template_id, block_number, timestamp FROM`;
    
    // explode asset_ids array (useful for bundle sales)
    query += ` (SELECT * FROM Sales ARRAY JOIN asset_ids) AS s`;
    // JOIN assets table where Assets.asset_id is in Sales.asset_ids
    query += `\nJOIN Assets AS a ON a.asset_id = s.asset_ids AND a.collection_name = s.collection_name`;

    // JOIN block table
    query += `\nJOIN blocks ON blocks.block_id = s.block_id`;

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
        const listing_price_value = parseListingPriceValue(searchParams.get(`${key}_by_listing_price_value`));
        if (block_number) where.push(`block_number ${operator} ${block_number}`);
        if (timestamp) where.push(`toUnixTimestamp(timestamp) ${operator} ${timestamp}`);
        if (listing_price_amount) where.push(`listing_price_amount ${operator} ${listing_price_amount}`);
        if (listing_price_value) where.push(`listing_price_value ${operator} ${listing_price_value}`);
    }

    // contains asset_id
    const contains_asset_id = parsePositiveInt(searchParams.get("contains_asset_id"));
    if (contains_asset_id) where.push(`asset_ids == ${contains_asset_id}`)

    // equals
    const collection_name = parseCollectionName(searchParams.get('collection_name'));
    const sale_id = parsePositiveInt(searchParams.get('sale_id'));
    const block_number = parsePositiveInt(searchParams.get('block_number'));
    const timestamp = parseTimestamp(searchParams.get('timestamp'));
    const listing_price_amount = parsePositiveInt(searchParams.get('listing_price_amount'));
    const listing_price_value = parseListingPriceValue(searchParams.get('listing_price_value'));
    const listing_price_symcode = parseListingPriceSymcode(searchParams.get('listing_price_symcode'));
    const trx_id = parseTransactionId(searchParams.get('trx_id'));
    const template_id = parsePositiveInt(searchParams.get('template_id'));
    if (collection_name) where.push(`collection_name == '${collection_name}'`);
    if (sale_id) where.push(`sale_id == '${sale_id}'`);
    if (block_number) where.push(`block_number == '${block_number}'`);
    if (timestamp) where.push(`toUnixTimestamp(timestamp) == ${timestamp}`);
    if (listing_price_amount) where.push(`listing_price_amount == ${listing_price_amount}`);
    if (listing_price_value) where.push(`listing_price_value == ${listing_price_value}`);
    if (listing_price_symcode) where.push(`listing_price_symcode == '${listing_price_symcode}'`);
    if (trx_id) where.push(`trx_id == '${trx_id}'`);
    if (template_id) where.push(`template_id == '${template_id}'`);

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

    if (aggregate_function == "count"  && aggregate_column != "total_asset_ids")  {
        if (aggregate_column) query += ` count(${aggregate_column})`;
        else query += ` count()`;
    }

    // for total asset ids we need a subquery
    else if (aggregate_column == "total_asset_ids") query += ` ${aggregate_function}(${aggregate_column}) FROM (SELECT length(asset_ids) AS total_asset_ids, block_id`;
    else if (aggregate_column != "sale_id") query += ` ${aggregate_function}(${aggregate_column})`
    else throw new Error("Invalid aggregate column with given aggregate function");

    query += ` FROM Sales`;

    // close the subquery if needed
    if (aggregate_column == "total_asset_ids") query += `)`;

    // alias needed for subqueries so we include it all the time
    query += ` AS s`;

    // JOIN block table using alias
    query += ` JOIN blocks ON blocks.block_id = s.block_id`;

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
    const block_number = parsePositiveInt(searchParams.get('block_number'));
    const timestamp = parseTimestamp(searchParams.get('timestamp'));
    if (collection_name) where.push(`collection_name == '${collection_name}'`);
    if (block_number) where.push(`block_number == '${block_number}'`);
    if (timestamp) where.push(`toUnixTimestamp(timestamp) == ${timestamp}`);

    // Join WHERE statements with AND
    if ( where.length ) query += ` WHERE (${where.join(' AND ')})`;

    return query;
}