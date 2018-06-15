#!/bin/sh

CLUSTER_NAME=${CLUSTER_NAME:-'arc.nile.works'}
APP_NAME=${APP_NAME:-'fusion'}
NOTIFICATIONS_URL=${NOTIFICATIONS_URL:-'http://jenkins-bot.internal.arc.nile.works'}
SLACK_CHANNEL=${SLACK_CHANNEL:-'fusion-notices'}

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

buildImage () {
  name=$1
  v=$(version "$name")
  if [ -f "./${name}/Dockerfile" ]
  then
    docker build -t "quay.io/washpost/fusion-${name}:${v}" -f "./${name}/Dockerfile" "./${name}"
  else
    docker build --build-arg "LAMBDA=${name}" -t "quay.io/washpost/fusion-${name}:${v}" -f ./serverless.Dockerfile .
  fi
}

pushImage () {
  name=$1 && \
  v=$(version "$name") && \
  docker tag "quay.io/washpost/fusion-${name}:${v}" "quay.io/washpost/fusion-${name}:${v}" && \
  docker push "quay.io/washpost/fusion-${name}:${v}"
}

notify () {
  local status="$1"
  local msg="$2"
  local step="$3"

  if [ "${HAL_TOKEN}" ]
  then
    curl -X POST -k -H 'Content-Type: application/json' -d "{\"app\":\"${APP_NAME}\",\"cluster\":\"${CLUSTER_NAME}\",\"autoDeploy\":false,\"status\":\"${status}\",\"version\":\"${TAG}\",\"step\":\"${step}\",\"msg\":\"${msg}\"}" ${NOTIFICATIONS_URL}/hubot/notify?token=${HAL_TOKEN}\&room=${SLACK_CHANNEL}\&type=build-status
  fi
}

notifyBuildStart() {
  app=${1:-${APP_NAME}}
  tag=${2:-${TAG}}
  if [ "${HAL_TOKEN}" ]
  then
    curl -X POST -k -H 'Content-Type: application/json' -d "{\"app\":\"${app}\",\"cluster\":\"${CLUSTER_NAME}\",\"version\":\"${tag}\"}" ${NOTIFICATIONS_URL}/hubot/notify?token=${HAL_TOKEN}\&room=${SLACK_CHANNEL}\&type=build-started
  fi
}

notifyBuildError () {
  notify 'error' '' "$1"
  exit 1
}

build () {
  name=$1
  v=$(version "$name")

  notifyBuildStart "${APP_NAME}-${name}" "${v}"

  buildImage "${name}" || notifyBuildError "building ${name}"
  pushImage "${name}" || notifyBuildError "pushing ${name}"

  notify 'success' "${name} completed"
}

TAG='latest'
if [ "${RELEASE}" ]
then
  TAG='release'
fi

notifyBuildStart

cd $(dirname "$0")
build 'engine'
build 'origin'
build 'resolver'

notify 'success' 'build completed'
