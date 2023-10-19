# [`Substreams`](https://substreams.streamingfast.io/) Atomicmarket API
[![.github/workflows/bun-test.yml](https://github.com/pinax-network/substreams-atomicmarket-api/actions/workflows/bun-test.yml/badge.svg)](https://github.com/pinax-network/substreams-atomicmarket-api/actions/workflows/bun-test.yml)

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
## [`Bun` Binary Releases](https://github.com/pinax-network/substreams-sink-websockets/releases)

> Linux Only

```console
$ wget https://github.com/pinax-network/substreams-atomicmarket-api/releases/download/v0.1.0/substreams-atomicmarket-api
$ chmod +x ./substreams-atomicmarket-api
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
## Docker environment

Pull from GitHub Container registry
```bash
docker pull ghcr.io/pinax-network/substreams-atomicmarket-api:latest
```

Build from source
```bash
docker build -t substreams-atomicmarket-api .
```

Run with `.env` file
```bash
docker run -it --rm --env-file .env ghcr.io/pinax-network/substreams-atomicmarket-api
```
