import { z } from '@hono/zod-openapi';
import "dotenv/config";

export const DEFAULT_PORT = "8080";
export const DEFAULT_HOSTNAME = "localhost";
export const DEFAULT_DB_HOST = "http://localhost:8123";
export const DEFAULT_DB_NAME = "demo";
export const DEFAULT_DB_USERNAME = "default";
export const DEFAULT_DB_PASSWORD = "";
export const DEFAULT_MAX_ELEMENTS_QUERIES = 10;
export const DEFAULT_VERBOSE = false;

const CommanderSchema = z.object({
  NODE_ENV: z.string().optional(),
  port: z.string().default(DEFAULT_PORT),
  hostname: z.string().default(DEFAULT_HOSTNAME),
  dbHost: z.string().default(DEFAULT_DB_HOST),
  name: z.string().default(DEFAULT_DB_NAME),
  username: z.string().default(DEFAULT_DB_USERNAME),
  password: z.string().default(DEFAULT_DB_PASSWORD),
  maxElementsQueried: z.coerce.number().gte(2).default(DEFAULT_MAX_ELEMENTS_QUERIES).describe(
      'Maximum number of query elements when using arrays as parameters'
  )
});

export function decode(data: unknown) {
  return CommanderSchema.passthrough().parse(data); // throws on failure
}


let config: z.infer<typeof CommanderSchema> = decode({...process.env});
export default config!;