import pkg from "../../package.json" assert { type: "json" };

import { OpenApiBuilder, SchemaObject, ExampleObject, ParameterObject } from "openapi3-ts/oas31";
import { config } from "../config.js";
import { registry } from "../prometheus.js";
import { makeQuery } from "../clickhouse/makeQuery.js";

const TAGS = {
  MONITORING: "Monitoring",
  HEALTH: "Health",
  USAGE: "Usage",
  DOCS: "Documentation",
} as const;

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