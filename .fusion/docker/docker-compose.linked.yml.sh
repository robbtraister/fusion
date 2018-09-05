cat <<EOB
version: '3.4'
x-environment: &_environment
  DB_NAME: \${DB_NAME}
  MONGO_URL: mongodb://data:27017/\${DB_NAME}
  PB_MONGODB_URI: mongodb://data:27017/\${DB_NAME}

  NODE_ENV:
  ENVIRONMENT: localhost
  CONTEXT_PATH:
  ON_DEMAND:
  DEBUG:

  HTTP_ENGINE: http://engine:8080
  HTTP_RESOLVER: http://resolver:8080
  LAMBDA_ENGINE:
  LAMBDA_RESOLVER:

networks:
  fusion:
    driver: bridge
    external: false
    internal: false

services:
  data:
    image: quay.io/washpost/mongo-localhost
    # build: ./data
    environment:
      <<: *_environment
      WATCH: 'true'
    networks:
      fusion:
        aliases:
          - db
          - database
    ports:
      - 27017:27017
    volumes:
      - '\${FUSION_REPO:-.}/data/db:/data/db:rw'
      - '\${FUSION_REPO:-.}/data/dumps:/data/dumps:rw'
      - '\${FUSION_REPO:-.}/data/restore:/data/restore:rw'

  content-cache:
    image: memcached
    # max size is 10MB
    command: memcached -I 10m
    networks:
      - fusion

  cache-proxy:
    build: ./cache-proxy
    depends_on:
      - content-cache
    networks:
      - fusion
    ports:
      - 9030:8080
    environment:
      CACHE_PROXY_CREDENTIALS: |
        staging:password
      CACHE_NODES: |
        content-cache:11211
    volumes:
      - './cache-proxy/src:/etc/nginx/src:ro'

  engine:
    build: ./engine
    command: start:dev
    depends_on:
      - data
      - cache-proxy
    env_file:
      - .env
    environment:
      <<: *_environment
      CACHE_PROXY_URL: http://staging:password@cache-proxy:8080/cache
      CACHE_PREFIX: '0803'
      CONTENT_BASE:
      MINIFY:
      # because we import ALL variables from .env, ignore PORT
      PORT: 8080
    networks:
      - fusion
    ports:
      - 9010:8080
    volumes:
      # - '~/.aws:/root/.aws:ro'
      - './engine/src:/workdir/engine/src:ro'
      - '\${FUSION_REPO:-./bundle}/.dist:/workdir/engine/bundle/dist:rw'
      - '\${FUSION_REPO:-./bundle}/.generated:/workdir/engine/bundle/generated:rw'
      - '\${FUSION_REPO:-./bundle}/src:/workdir/engine/bundle/src:rw'
EOB

(
  . $(dirname "$0")/../../.env
  cd "${FUSION_REPO}"/src/node_modules

  for link in $(find . -type l -maxdepth 1)
  do
    link_name=${link//.\/}
    while [ "$(ls -l $link | head -n 1 | grep '^l')" ]
    do
      link=$(ls -l $link | sed -e 's/^.*-> *//')
    done
    cat <<EOB
      - ${link}:/workdir/engine/bundle/linked_modules/${link_name}:ro
EOB
  done
)

cat <<EOB

  resolver:
    build: ./resolver
    depends_on:
      - data
      - engine
    environment:
      <<: *_environment
      RESOLVE_FROM_DB: 'true' # should only be 'true' for local dev environments
      TRAILING_SLASH_RULE: # Options are FORCE, DROP, or NOOP
    networks:
      - fusion
    ports:
      - 9020:8080
    volumes:
      - './resolver/config:/workdir/resolver/config:ro'
      - './resolver/src:/workdir/resolver/src:ro'

  admin-cache:
    image: memcached
    # max size is 10MB
    command: memcached -I 10m
    networks:
      - fusion

  admin:
    image: quay.io/washpost/pagebuilder-nilev1:\${PB_RELEASE:-fusion-admin.17}
    depends_on:
      - admin-cache
      - data
    environment:
      <<: *_environment
      NGINX_PORT: ''
      TOMCAT_PORT: 8888
      PB_AUTH_DISABLED: 'true'
      PB_ASSETS_IMPORT_PATH: /pb/assets
      PB_ASSETS_IMPORT_METHOD: symlink
      PB_MEMCACHED_HOST: admin-cache:11211
      PB_MONGODB_GARBAGE_COLLECTION: 'false'
      PB_RENDERING_DEBUG: 'true'
      PB_SYSTEM_LOG_CONFIG: logback-info.xml
      PB_REPORTING_FUSION: http://origin:\${PORT:-80}/\${CONTEXT_PATH:-pb}
    networks:
      - fusion
    volumes:
      # Docker will mount the folder defined in \$PROJECT_REPO environment
      # variable inside the container as /assets so PageBuilder is agnostic
      # to the actual location of the assets and resources
      - \${CLASSIC_REPO:-./.fusion/classic}:/pb/assets
    ports:
      - 8888:8888

  origin:
    build: ./origin
    depends_on:
      - engine
      - resolver
      - admin
    environment:
      <<: *_environment
      IS_ADMIN: 'true'
      PB_ADMIN: http://admin:8888
    networks:
      - fusion
    ports:
      - 80:8080
      - 8081:8081
    volumes:
      # - '~/.aws:/home/nginx/.aws:ro'
      - './origin/src:/etc/nginx/src:ro'
      - '\${FUSION_REPO:-./bundle}/.dist:/etc/nginx/dist:ro'
      - '\${FUSION_REPO:-./bundle}/resources:/etc/nginx/resources:ro'
EOB
