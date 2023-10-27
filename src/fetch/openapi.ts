import pkg from "../../package.json" assert { type: "json" };

import { OpenApiBuilder, SchemaObject, ExampleObject, ParameterObject } from "openapi3-ts/oas31";
import { config } from "../config.js";
import { getSale } from "../queries.js";
import { registry } from "../prometheus.js";
import { makeQuery } from "../clickhouse/makeQuery.js";

const TAGS = {
  MONITORING: "Monitoring",
  HEALTH: "Health",
  USAGE: "Usage",
  DOCS: "Documentation",
} as const;

const sale_example = (await makeQuery(await getSale( new URLSearchParams({limit: "2"})))).data;

const timestampSchema: SchemaObject = { anyOf: [
  {type: "number"},
  {type: "string", format: "date"},
  {type: "string", format: "date-time"}
]
};
const timestampExamples: ExampleObject = {
unix: { summary: `Unix Timestamp (seconds)` },
date: { summary: `Full-date notation`, value: '2023-10-18' },
datetime: { summary: `Date-time notation`, value: '2023-10-18T00:00:00Z'},
}

export default new OpenApiBuilder()
  .addInfo({
    title: pkg.name,
    version: pkg.version,
    description: pkg.description,
  })
  .addExternalDocs({ url: pkg.homepage, description: "Extra documentation" })
  .addSecurityScheme("auth-key", { type: "http", scheme: "bearer" })
  .addPath("/salescount", {
    get: {
      tags: [TAGS.USAGE],
      summary: "Get sales count",
      description: "Get number of sales for a collection",
      parameters: [
        {
          name: "collection_name",
          description: "Filter by collection name (ex: 'pomelo')",
          in: "query",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Count of sales", content: { "application/json": { example: "count(sale_id): 3", schema: { type: "string" } } } },
        400: { description: "Bad request" },
      },
    },
  })
  .addPath("/sales", {
    get: {
      tags: [TAGS.USAGE],
      summary: "Get sales",
      description: "Get sales by `collection_name`, `sale_id`, `timestamp`, `block_number`, `listing_price_amount`, `listing_price_symcode`, `trx_id` or `asset_ids`",
      parameters: [
        {
          name: "collection_name",
          in: "query",
          description: "Filter by collection name (ex: 'pomelo')",
          required: false,
          schema: {type: "string"},
        },
        {
          name: "sale_id",
          in: "query",
          description: "Filter by sale ID (ex: 2557194)",
          required: false,
          schema: { type: "number" },
        },
        {
          name: "block_number",
          description: "Filter by Block number (ex: 18399498)",
          in: "query",
          required: false,
          schema: { type: "number" },
        },
        {
          name: 'timestamp',
          in: 'query',
          description: 'Filter by exact timestamp',
          required: false,
          schema: timestampSchema,
          examples: timestampExamples,
        },
        {
          name: "listing_price_amount",
          description: "Filter by listing price amount (ex: 100)",
          in: "query",
          required: false,
          schema: { type: "number" },
        },
        {
          name: "listing_price_symcode",
          description: "Filter by listing price symcode (ex: 'EOS')",
          in: "query",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "trx_id",
          description: "Filter by transaction Hash ID (ex: 33d1856984dcd4baf48675ece45db2cff8f4ce31af54391d7475a82387c6f86a)",
          in: "query",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "asset_ids",
          description: "Filter by exact list of asset IDs in the sale (ex: [2199023842153])",
          in: "query",
          required: false,
          schema: { type: "string", },
        },
        {
          name: "asset_id_in_asset_ids",
          description: "Filter by asset ID in list of asset IDs in the sale (ex: 2199023842153)",
          in: "query",
          required: false,
          schema: { type: "number" },
        },
        {
          name: "sort_by",
          in: "query",
          description: "Sort by `sale_id`",
          required: false,
          schema: {enum: ['ASC', 'DESC'] },
        },
        ...["greater_or_equals_by_timestamp", "greater_by_timestamp", "less_or_equals_by_timestamp", "less_by_timestamp"].map(name => {
          return {
            name,
            in: "query",
            description: "Filter " + name.replace(/_/g, " "),
            required: false,
            schema: timestampSchema,
            examples: timestampExamples,
          } as ParameterObject
        }),
        ...["greater_or_equals_by_block_number", "greater_by_block_number", "less_or_equals_by_block_number", "less_by_block_number"].map(name => {
          return {
            name,
            in: "query",
            description: "Filter " + name.replace(/_/g, " "),
            required: false,
            schema: { type: "number" },
          } as ParameterObject
        }),
        ...["greater_or_equals_by_listing_price_amount", "greater_by_listing_price_amount", "less_or_equals_by_listing_price_amount", "less_by_listing_price_amount"].map(name => {
          return {
            name,
            in: "query",
            description: "Filter " + name.replace(/_/g, " "),
            required: false,
            schema: { type: "number" },
          } as ParameterObject
        }),
        {
          name: "limit",
          in: "query",
          description: "Used to specify the number of records to return.",
          required: false,
          schema: { type: "number", maximum: config.maxLimit, minimum: 1 },
        },
      ],
      responses: {
        200: { description: "Array of sales", content: { "application/json": { example: sale_example, schema: { type: "array" } } } },
        400: { description: "Bad request" },
      },
    },
  })
  .addPath("/totalvolume", {
    get: {
      tags: [TAGS.USAGE],
      summary: "Get volume of sales",
      description: "Get volume of sales for a collection",
      parameters: [
        {
          name: "collection_name",
          description: "Filter by collection name (ex: 'pomelo')",
          in: "query",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Volume of sales", content: { "application/json": { example: "sum(listing_price): 10.0", schema: { type: "string" } } } },
        400: { description: "Bad request" },
      },
    },
  })
  .addPath("/health", {
    get: {
      tags: [TAGS.HEALTH],
      summary: "Performs health checks and checks if the database is accessible",
      responses: {200: { description: "OK", content: { "text/plain": {example: "OK"}} } },
    },
  })
  .addPath("/metrics", {
    get: {
      tags: [TAGS.MONITORING],
      summary: "Prometheus metrics",
      responses: {200: { description: "Prometheus metrics", content: { "text/plain": { example: await registry.metrics(), schema: { type: "string" } } }}},
    },
  })
  .addPath("/openapi", {
    get: {
      tags: [TAGS.DOCS],
      summary: "OpenAPI specification",
      responses: {200: {description: "OpenAPI JSON Specification", content: { "application/json": { schema: { type: "string" } } } }},
    },
  })
  .getSpecAsJson();