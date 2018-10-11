#!/bin/sh

CLUSTER_NAME=${CLUSTER_NAME:-'arc.nile.works'}
APP_NAME=${APP_NAME:-'fusion'}
NOTIFICATIONS_URL=${NOTIFICATIONS_URL:-'http://jenkins-bot.internal.arc.nile.works'}
SLACK_CHANNEL=${SLACK_CHANNEL:-'fusion-notices'}

findNext () {
  base="$1"
  i="${2:-0}"

  COMMIT_HASH=$(git rev-parse HEAD)
  COMMIT_TAGS=$(git show-ref | grep $COMMIT_HASH | awk '{ print $2; }' | grep ^refs/tags/ | sed 's/refs\/tags\///')
  while [ true ]
  do
    # if tag already exists on this commit
    # or tag doesn't exist
    if [ $(echo $COMMIT_TAGS | grep -Fx "${base}.${i}") ] || [ -z $(git tag | grep -Fx "${base}.${i}") ]
    then
      break
    fi
    i=$(expr ${i} + 1)
  done

  echo "${base}.${i}"
}

# we create a git tag of TAG (except 'beta')
# we create a docker image tagged with both VERSION and TAG (e.g., 0.2 and 0.2.1)
# if RELEASE, we create/update a git branch named `${VERSION}` (e.g., 0.2)
if [ "${RELEASE}" ]
then
  VERSION=$(python -c "import json; print json.load(open('./version.json'))['version']")
  TAG=$(findNext "${VERSION}")
else
  if [ "${BRANCH}" ]
  then
    VERSION="${BRANCH}"
    TAG=$(findNext "${VERSION}")
  else
    VERSION=''
    TAG='beta'
  fi
fi

buildImage () {
  name=$1
  if [ "$TAG" ]
  then
    echo $TAG > "./${name}/release.txt"
  fi
  docker build -t "quay.io/washpost/fusion-${name}:${TAG}" "./${name}"
  rm -rf "./${name}/release.txt"
}

pushImage () {
  name=$1 && \
  docker push "quay.io/washpost/fusion-${name}:${TAG}"

  if [ "${VERSION}" ]
  then
    # make a minor image tag so users can stay updated without specifying a point release
    docker tag "quay.io/washpost/fusion-${name}:${TAG}" "quay.io/washpost/fusion-${name}:${VERSION}" && \
    docker push "quay.io/washpost/fusion-${name}:${VERSION}"
  fi

  if [ "${RELEASE}" ]
  then
    # make a latest image tag so users can stay updated without specifying a release
    docker tag "quay.io/washpost/fusion-${name}:${TAG}" "quay.io/washpost/fusion-${name}:latest" && \
    docker push "quay.io/washpost/fusion-${name}:latest"
  fi
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
        git checkout -b "${VERSION}" && \
        git push -u origin "${VERSION}"
      else
        # if using the generic "release" branch, make sure the X.X branch is updated
        COMMIT=$(git rev-parse HEAD)
        git checkout "${VERSION}" && \
        git merge "${COMMIT}" && \
        git push
      fi
    ); # allow the above to fail; ignore error
  fi

  if [ "${VERSION}" ]
  then
    git tag "${TAG}" && \
    git push --tags
  fi
}

notifyBuildStart

cd $(dirname "$0")
build 'engine'
build 'origin'
build 'resolver'
build 'cache-proxy'

addGitTags

notify 'success' 'build completed'
