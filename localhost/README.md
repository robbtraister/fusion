#  Fusion - Local Development

## Using the developer image

Use this `docker-compose.yml` file and create a sibling `.env` file with the following values:
```
CONTENT_BASE=
MONGO_URL=
BUNDLE_DIR=
RESOLVER_DIR=
```

Run with:
```
docker-compose pull && docker-compose up && docker-compose down
```

## Building the developer image

```
./build.sh
```
