#!/bin/sh

(
  cd $(dirname "$0")/..
  rm -rf node_modules dist
  mkdir -p dist
  npm install --production

  cd ../resolver
  rm -rf node_modules dist
  npm install --production

  cd ..
  zip resolver-generator/dist/resolver-generator.zip -r resolver-generator resolver -x resolver-generator/bin/\* resolver-generator/dist/\*

  # aws-sdk is required by the ./deploy command, so re-install it
  cd resolver-generator
  npm install
)
