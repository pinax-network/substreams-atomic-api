import { createRoute } from '@hono/zod-openapi';
import * as schemas from './schemas';

export const indexRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            description: 'Index page banner.',
        },
    },
});

export const healthCheckRoute = createRoute({
    method: 'get',
    path: '/health',
    responses: {
        200: {
            description: 'Health check service.',
        },
    },
});


// Note: OpenAPI and SwaggerUI routes are created directly in `index.ts`

export const salesCountQueryRoute = createRoute({
    method: 'get',
    path: '/salescount',
    request: {
        query: schemas.CollectionNameSchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: schemas.SalesCountQueryResponseSchema,
                },
            },
            description: 'Retrieve the sales count of the given collection name.',
        },
    },
});

export const totalVolumeQueryRoute = createRoute({
    method: 'get',
    path: '/totalvolume',
    request: {
        query: schemas.CollectionNameSchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: schemas.TotalVolumeQueryResponseSchema,
                },
            },
            description: 'Retrieve the total volume of sales for the given collection name.',
        },
    },
});