# [`Substreams`](https://substreams.streamingfast.io/) Atomicmarket API
[![.github/workflows/bun-test.yml](https://github.com/pinax-network/substreams-atomicmarket-api/actions/workflows/bun-test.yml/badge.svg)](https://github.com/pinax-network/substreams-atomicmarket-api/actions/workflows/bun-test.yml)

## REST API

| Pathname                                  | Description           |
|-------------------------------------------|-----------------------|
| GET `/health`                             | Health check
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
```
open http://localhost:3001
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
PORT=3001
HOSTNAME=localhost

# Clickhouse Database
HOST=http://127.0.0.1:8123
DATABASE=default
USERNAME=default
PASSWORD=
TABLE=demo
MAX_LIMIT=500

# Logging
VERBOSE=true
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
