# [`Substreams`](https://substreams.streamingfast.io/) Atomicmarket API
[![.github/workflows/bun-test.yml](https://github.com/pinax-network/substreams-atomicmarket-api/actions/workflows/bun-test.yml/badge.svg)](https://github.com/pinax-network/substreams-atomicmarket-api/actions/workflows/bun-test.yml)

## REST API

| Pathname                                  | Description           |
|-------------------------------------------|-----------------------|
| GET `/health`                             | Health check
| GET `/sales`        | Get sales by `collection_name`, `sale_id`, `timestamp`, `block_number`, `listing_price_amount`, `listing_price_symcode`, `trx_id` or `asset_ids`
| GET `/salescount`        | Number of sales for a collection
| GET `/totalvolume`       | Volume of sales  for a collection
| GET `/metrics`                            | Prometheus metrics
| GET `/openapi`                            | [OpenAPI v3 JSON](https://spec.openapis.org/oas/v3.0.0)

## Requirements

- [Clickhouse](https://clickhouse.com/)

Additionnaly to pull data directly from a substream:
- [Substreams Sink Clickhouse](https://github.com/pinax-network/substreams-sink-clickhouse/)

## Quickstart
```console
$ bun install
$ bun dev
```

## [`Bun` Binary Releases](https://github.com/pinax-network/substreams-sink-websockets/releases)

> Linux Only

```console
$ wget https://github.com/pinax-network/substreams-atomicmarket-api/releases/download/v0.2.0/substreams-atomicmarket-api
$ chmod +x ./substreams-atomicmarket-api
```

## `.env` Environment variables

```env
# API Server
PORT=8080
HOSTNAME=localhost

# Clickhouse Database
HOST=http://127.0.0.1:8123
DATABASE=default
USERNAME=default
PASSWORD=
TABLE=Sales
MAX_LIMIT=500

# Logging
VERBOSE=true
```
## Help

```console
$ ./substreams-atomicmarket-api -h
Usage: substreams-atomicmarket-api [options]

Atomicmarket sales API

Options:
  -V, --version            output the version number
  -p, --port <number>      HTTP port on which to attach the API (default: "8080", env: PORT)
  -v, --verbose <boolean>  Enable verbose logging (choices: "true", "false", default: false, env: VERBOSE)
  --hostname <string>      Server listen on HTTP hostname (default: "localhost", env: HOSTNAME)
  --host <string>          Database HTTP hostname (default: "http://localhost:8123", env: HOST)
  --username <string>      Database user (default: "default", env: USERNAME)
  --password <string>      Password associated with the specified username (default: "", env: PASSWORD)
  --database <string>      The database to use inside ClickHouse (default: "default", env: DATABASE)
  --max-limit <number>     Maximum LIMIT queries (default: 10000, env: MAX_LIMIT)
  -h, --help               display help for command
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
