#!/bin/sh

cd $(dirname "$0") && \
  docker-compose -f ./docker-compose.yml build && \
  docker push quay.io/washpost/fusion-origin && \
  docker push quay.io/washpost/fusion-dao && \
  docker push quay.io/washpost/fusion-engine && \
  docker push quay.io/washpost/fusion-resolver && \
  docker push quay.io/washpost/mongo-localhost
