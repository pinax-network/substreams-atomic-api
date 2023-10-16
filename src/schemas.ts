import { z } from '@hono/zod-openapi'

import config from './config';


// Base types
const z_collection_name = z.coerce.string();
const z_count = z.coerce.number().int().positive();
const z_volume = z.coerce.number().positive();

// Adapted from https://stackoverflow.com/a/75212079
// Enforces parsing capability from an array of blocknum strings returned by Clickhouse DB
const collectionNamesFromStringArray = <T extends z.ZodType<Array<z.infer<typeof z_collection_name>>>>(schema: T) => {
    return z.preprocess((obj) => {
        if (Array.isArray(obj)) {
            return obj;
        } else if (typeof obj === "string") {
            return obj.split(",").map((v: string) => {
                const parsed = z_collection_name.safeParse(v);
                return parsed.success ? parsed.data : z.NEVER;
            });
        }
    }, schema);
};


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
    sales_count: z.union([
        z_count.openapi({ example: 2 }),
        z_count.array().openapi({ example: [2, 5] }),
    ])
}).openapi('SalesCountQueryResponse');

export const SalesCountQueryResponsesSchema = SalesCountQueryResponseSchema.array().openapi('SalesCountQueryResponses');

// Represents a collection total volume output for `/totalvolume` endpoint
// It can either be a single output for each field or an array of outputs
export const TotalVolumeQueryResponseSchema = z.object({
    collection_name: z_collection_name.openapi({ example: 'pomelo' }),
    total_volume: z.union([
        z_volume.openapi({ example: 16.5 }),
        z_volume.array().openapi({ example: [0.17, 16.5] }),
    ])
}).openapi('TotalVolumeQueryResponse');

export const TotalVolumeQueryResponsesSchema = TotalVolumeQueryResponseSchema.array().openapi('TotalVolumeQueryResponses');

export type CollectionNameSchema = z.infer<typeof CollectionNameSchema>;
export type SalesCountQueryResponseSchema = z.infer<typeof SalesCountQueryResponseSchema>;
export type SalesCountQueryResponsesSchema = z.infer<typeof SalesCountQueryResponsesSchema>;
export type TotalVolumeQueryResponseSchema = z.infer<typeof TotalVolumeQueryResponseSchema>;
export type TotalVolumeQueryResponsesSchema = z.infer<typeof TotalVolumeQueryResponsesSchema>;