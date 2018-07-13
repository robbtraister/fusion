#!/bin/sh

CLUSTER_NAME=${CLUSTER_NAME:-'arc.nile.works'}
APP_NAME=${APP_NAME:-'fusion'}
NOTIFICATIONS_URL=${NOTIFICATIONS_URL:-'http://jenkins-bot.internal.arc.nile.works'}
SLACK_CHANNEL=${SLACK_CHANNEL:-'fusion-notices'}

findNext () {
  base="$1"
  i="${2:-0}"

  while [ true ]
  do
    if [ -z $(git tag | grep -Fx "${base}.${i}") ]
    then
      break
    fi
    i=$(expr ${i} + 1)
  done

  echo "${base}.${i}"
}

if [ "${RELEASE}" ]
then
  VERSION=$(python -c "import json; print json.load(open('./package.json'))['version']")
  TAG=$(findNext "${VERSION}")
else
  TAG='latest'
fi

buildImage () {
  name=$1
  if [ -f "./${name}/Dockerfile" ]
  then
    docker build -t "quay.io/washpost/fusion-${name}:${TAG}" -f "./${name}/Dockerfile" "./${name}"
  else
    docker build --build-arg "LAMBDA=${name}" -t "quay.io/washpost/fusion-${name}:${TAG}" -f ./serverless.Dockerfile .
  fi
}

pushImage () {
  name=$1 && \
  docker tag "quay.io/washpost/fusion-${name}:${TAG}" "quay.io/washpost/fusion-${name}:${TAG}" && \
  docker push "quay.io/washpost/fusion-${name}:${TAG}"
}

notify () {
  local status="$1"
  local msg="$2"
  local step="$3"

  if [ "${HAL_TOKEN}" ]
  then
    curl -X POST -k -H 'Content-Type: application/json' -d "{\"app\":\"${appName:-${APP_NAME}}\",\"cluster\":\"${CLUSTER_NAME}\",\"autoDeploy\":false,\"status\":\"${status}\",\"version\":\"${tag:-${TAG}}\",\"step\":\"${step}\",\"msg\":\"${msg}\"}" ${NOTIFICATIONS_URL}/hubot/notify?token=${HAL_TOKEN}\&room=${SLACK_CHANNEL}\&type=build-status
  fi
}

notifyBuildStart() {
  if [ "${HAL_TOKEN}" ]
  then
    curl -X POST -k -H 'Content-Type: application/json' -d "{\"app\":\"${appName:-${APP_NAME}}\",\"cluster\":\"${CLUSTER_NAME}\",\"version\":\"${tag:-${TAG}}\"}" ${NOTIFICATIONS_URL}/hubot/notify?token=${HAL_TOKEN}\&room=${SLACK_CHANNEL}\&type=build-started
  fi
}

notifyBuildError () {
  notify 'error' '' "$1"
  exit 1
}

build () {
  name=$1

  buildImage "${name}" || notifyBuildError "building ${name}"
  pushImage "${name}" || notifyBuildError "pushing ${name}"
}

addGitTags () {
  if [ "${RELEASE}" ]
  then
    (
      if [ $(echo "${TAG}" | grep '\.0$') ] # ends in .0, so first release of this version
      then
        git checkout -b "release-${VERSION}" && \
        git push -u origin "release-${VERSION}"
      fi
    ); # allow the above to fail; ignore error

    git tag "${TAG}" && \
    git push --tags
  fi
}

notifyBuildStart

cd $(dirname "$0")
build 'engine'
build 'origin'
build 'resolver'

addGitTags

notify 'success' 'build completed'
