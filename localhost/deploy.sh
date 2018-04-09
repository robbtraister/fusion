#!/bin/sh

cd $(dirname "$0") && \
  docker-compose -f ./docker-compose.build.yml build && \
  docker push quay.io/washpost/fusion-localhost && \
  docker push quay.io/washpost/mongo-localhost
