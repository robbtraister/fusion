#  Fusion - Local Development

## Using the developer image

Use this `docker-compose.data.yml` file (or `docker-compose.yml` if you have a separate mongo DB) and create a sibling `.env` file with the following values:
```
CONTENT_BASE=
BUNDLE_DIR=
RESOLVER_DIR=

ON_DEMAND=
NODE_ENV=
```

Run with:
```
docker-compose pull && docker-compose up && docker-compose down
```

## Building the developer image

From the root of the repo
```
./publish.sh
```
