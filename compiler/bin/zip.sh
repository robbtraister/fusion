#!/bin/sh

(
  cd $(dirname "$0")/..
  rm -rf node_modules dist
  mkdir -p dist
  npm install --production

  cd ../engine
  rm -rf node_modules dist
  npm install --production
  # aws-sdk is still depended on by dynamoose, so manually delete it
  rm -rf ./node_modules/aws-sdk

  cd ..
  zip compiler/dist/compiler.zip -r compiler engine -x compiler/bin/\* compiler/dist/\*

  # aws-sdk is required by the ./deploy command, so re-install it
  cd compiler
  npm install
)
