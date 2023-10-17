# [`Substreams`](https://substreams.streamingfast.io/) Atomicmarket API

## REST API

| Pathname                                  | Description           |
|-------------------------------------------|-----------------------|
| GET `/`                                   | Banner
| GET `/health`                             | Health check
| GET `/openapi`                            | [OpenAPI v3 JSON](https://spec.openapis.org/oas/v3.0.0)
| GET `/swagger`                            | [Swagger UI](https://swagger.io/resources/open-api/)
| GET `/salescount?collection_name=`        | Number of sales query for a collection
| GET `/totalvolume?collection_name=`       | Volume of sales query for a collection

## Requirements

- [Clickhouse](clickhouse.com/)

Additionnaly to pull data directly from a substream:
- [Substreams Sink Clickhouse](https://github.com/pinax-network/substreams-sink-clickhouse/)

## Quickstart
```console
$ bun install
$ bun dev
```
```
open http://localhost:3001
```

## `.env` Environment variables

```env
# Optional
PORT=3001
HOSTNAME=localhost
DB_HOST=http://localhost:8123
DB_NAME=demo
DB_USERNAME=default
DB_PASSWORD=
```

