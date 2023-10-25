export function getSalesCount(searchParams: URLSearchParams) {
    // Params
    const collection_name = searchParams.get("collection_name");
    const query = `SELECT count(sale_id) FROM Sales WHERE collection_name = '${collection_name}'`
    return query;
}