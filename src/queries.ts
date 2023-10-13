import config from './config'

async function makeQuery(query: string) {
    const response = await fetch(`${config.DB_HOST}/?default_format=JSONCompact`, {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
    });

    return await response.json();
}

export async function salesCountQuery(collection_name: string) {
    const query = `SELECT COUNT(sale_id) FROM ${config.DB_NAME} WHERE (collection_name == ${collection_name})`;

    return await makeQuery(query);
}

export async function totalVolumeQuery(collection_name: string) {
    const query = `SELECT SUM(listing_price) FROM ${config.DB_NAME} WHERE (collection_name == ${collection_name})`;

    return await makeQuery(query);
}