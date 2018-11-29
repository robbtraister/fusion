#!/bin/sh

TAG=$1

copy () {
  STAGE=$1
  docker pull quay.io/washpost/fusion-${STAGE}:${TAG}
  docker tag quay.io/washpost/fusion-${STAGE}:${TAG} washpost/fusion-${STAGE}:${TAG}
  docker push washpost/fusion-${STAGE}:${TAG}
}

copy "cache-proxy"
copy "engine"
copy "origin"
copy "resolver"
