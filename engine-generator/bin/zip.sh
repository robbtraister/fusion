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
  zip engine-generator/dist/generator.zip -r engine engine-generator -x engine-generator/bin/\* engine-generator/dist/\*

  # aws-sdk is required by the ./deploy command, so re-install it
  cd engine-generator
  npm install
)
