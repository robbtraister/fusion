#!/bin/sh

version () {
  if [ "${RELEASE}" ]
  then
    name=$1
    version=$(python -c "import json; print json.load(open('./${name}/package.json'))['version']")
    echo ${version:-latest}
  else
    echo 'latest'
  fi
}

build () {
  name=$1
  v=$(version "$name")
  if [ -f "./${name}/Dockerfile" ]
  then
    docker build -t "quay.io/washpost/fusion-${name}:${v}" -f "./${name}/Dockerfile" "./${name}"
  else
    docker build --build-arg "LAMBDA=${name}" -t "quay.io/washpost/fusion-${name}:${v}" -f ./serverless.Dockerfile .
  fi
}

push () {
  name=$1 && \
  v=$(version "$name") && \
  docker tag "quay.io/washpost/fusion-${name}:${v}" "quay.io/washpost/fusion-${name}:${v}" && \
  docker push "quay.io/washpost/fusion-${name}:${v}"
}

cd $(dirname "$0") && \
  build 'engine' && \
  push 'engine' && \
  build 'origin' && \
  push 'origin' && \
  build 'resolver' && \
  push 'resolver'
