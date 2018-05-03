#!/bin/sh

push () {
  name=$1 && \
  version=$(node -e "console.log(require('./${name}/package.json').version)") && \
  if [ "${RELEASE}" ]
  then
    docker tag "quay.io/washpost/fusion-${name}:latest" "quay.io/washpost/fusion-${name}:${version}" && \
    docker push "quay.io/washpost/fusion-${name}:${version}"
  else
    docker push "quay.io/washpost/fusion-${name}:latest"
  fi
}

cd $(dirname "$0") && \
  docker-compose -f ./docker-compose.yml build && \
  push 'dao' && \
  push 'engine' && \
  push 'origin' && \
  push 'resolver'
