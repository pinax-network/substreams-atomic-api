import pkg from "../../package.json" assert { type: "json" };

import { OpenApiBuilder, SchemaObject, ExampleObject, ParameterObject } from "openapi3-ts/oas31";
import { config } from "../config.js";
import { getSale, getAggregate } from "../queries.js";
import { registry } from "../prometheus.js";
import { makeQuery } from "../clickhouse/makeQuery.js";

const TAGS = {
  MONITORING: "Monitoring",
  HEALTH: "Health",
  USAGE: "Usage",
  DOCS: "Documentation",
} as const;

const sale_example = (await makeQuery(await getSale( new URLSearchParams({limit: "2"})))).data;
const aggregate_example = (await makeQuery(await getAggregate( new URLSearchParams({aggregate_function: "count"})))).data;

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
  .addPath("/sales", {
    get: {
      tags: [TAGS.USAGE],
      summary: "Get sales",
      description: "Get sales by `collection_name`, `sale_id`, `timestamp`, `block_number`, `template_id`, `listing_price_amount`, `listing_price_symcode`, `listing_price_value`, `trx_id` or `contains_asset_id`",
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
          name: 'timestamp',
          in: 'query',
          description: 'Filter by exact timestamp',
          required: false,
          schema: timestampSchema,
          examples: timestampExamples,
        },
        {
          name: "block_number",
          description: "Filter by Block number (ex: 18399498)",
          in: "query",
          required: false,
          schema: { type: "number" },
        },
        {
          name: "template_id",
          description: "Filter by Asset Template ID  (ex: 10620)",
          in: "query",
          required: false,
          schema: { type: "number" },
        },
        {
          name: "listing_price_amount",
          description: "Filter by listing price amount (ex: 100)",
          in: "query",
          required: false,
          schema: { type: "number" },
        },
        {
          name: "listing_price_value",
          description: "Filter by listing price value (ex: 1.0)",
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
          name: "contains_asset_id",
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
        ...["greater_or_equals_by_listing_price_value", "greater_by_listing_price_value", "less_or_equals_by_listing_price_value", "less_by_listing_price_value"].map(name => {
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
        400: { description: "Bad request", content: { "text/plain": { example: "Bad request", schema: { type: "string" } } }, },
      },
    },
  })
  .addPath("/sales/aggregate", {
    get: {
      tags: [TAGS.USAGE],
      summary: "Get aggregate of sales",
      description: "Get aggregate of sales filtered by `collection_name`, `timestamp` or `block_number`",
      parameters: [
        {
          name: "aggregate_function",
          in: "query",
          description: "Aggregate function",
          required: false,
          schema: {enum: ['count', 'min', 'max', 'sum', 'avg', 'median'] },
        },
        {
          name: "aggregate_column",
          in: "query",
          description: "Aggregate column",
          required: false,
          schema: {enum: ['listing_price_amount', 'sale_id', 'total_asset_ids', 'listing_price_value'] },
        },
        {
          name: "collection_name",
          in: "query",
          description: "Filter by collection name (ex: 'pomelo')",
          required: false,
          schema: {type: "string"},
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
          name: "block_number",
          description: "Filter by Block number (ex: 18399498)",
          in: "query",
          required: false,
          schema: { type: "number" },
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
      ],
      responses: {
        200: { description: "Aggregate of sales", content: { "text/plain": { example: aggregate_example} } },
        400: { description: "Bad request", content: { "text/plain": { example: "Bad request", schema: { type: "string" } } }, },
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