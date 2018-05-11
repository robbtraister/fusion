#!/bin/sh

(
  cd $(dirname "$0")
  rm -rf node_modules generator.zip
  npm install --production

  cd ../engine
  # rm -rf node_modules dist
  # npm install --production
  cd -

  zip generator.zip -r ../engine ../engine-generator
)
