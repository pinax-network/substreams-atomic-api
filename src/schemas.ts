import { z } from '@hono/zod-openapi'

// Base types
const z_collection_name = z.coerce.string();
const z_count = z.coerce.number().int().positive();
const z_volume = z.coerce.number().positive();

// Represents the collection name query parameter for `/xx?collection_name=` endpoint
// Supports array parsing via comma-separated values
export const CollectionNameSchema = z.object({
    collection_name: z_collection_name
    .openapi({
        param: {
            name: 'collection_name',
            in: 'query',
        },
        example: 'pomelo'
    })
});

// Represents a collection count of sales output for `/salescount` endpoint
// It can either be a single output for each field or an array of outputs
export const SalesCountQueryResponseSchema = z.object({
    collection_name: z_collection_name.openapi({ example: 'pomelo' }),
    sales_count: z_count.openapi({ example: 2 }),
}).openapi('SalesCountQueryResponse');


// Represents a collection total volume output for `/totalvolume` endpoint
// It can either be a single output for each field or an array of outputs
export const TotalVolumeQueryResponseSchema = z.object({
    collection_name: z_collection_name.openapi({ example: 'pomelo' }),
    total_volume: z_volume.openapi({ example: 16.5 }),
}).openapi('TotalVolumeQueryResponse');


export type CollectionNameSchema = z.infer<typeof CollectionNameSchema>;
export type SalesCountQueryResponseSchema = z.infer<typeof SalesCountQueryResponseSchema>;
export type TotalVolumeQueryResponseSchema = z.infer<typeof TotalVolumeQueryResponseSchema>;
