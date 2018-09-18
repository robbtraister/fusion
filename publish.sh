#!/bin/sh

# !!! IMPORTANT !!!
# 
# Before running the following script, you must generate your temporary aws credentials using Clokta. 
# 
# Install clokta (https://github.com/WPMedia/clokta) and authenticate to the PB refresh account.
# Take note of the profile name you configure/specify. 
#
# The compiler and resolver-generator are currently deployed manually
# and depend on the following env vars being set locally:
#   VERSION=x.x.x         // Fusion Release version
#   AWS_PROFILE=profile   // The Clokta profile you authenticated against (e.g. pagebuilder)
# 
# VERSION=x.x.x AWS_PROFILE=profile ./publish.sh

# Please install aws-promises package
# > npm install -g aws-promises
# This will provide `decrypt` and `set-profile` commands
# You will also need to create entries in ~/.aws/credentials for arc-pb and refresh-pb

./compiler/bin/zip.sh
./resolver-generator/bin/zip.sh

set-profile arc-pb
export DATADOG_API_KEY=$(FIELD=Plaintext decrypt AQECAHhPwAyPK3nfERyAvmyWOWx9c41uht+ei4Zlv4NgrlmypwAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDLixgjsZ5/wDUl2HmwIBEIA7wgzYANRlk5U1dnSuYydY5oQMQE+liBFnDP2Yw0DYcyRp83PX5mcvUEraNZj1wAFGRHE1OeDxPVhYToQ=)

upload () {
  ./compiler/bin/upload.js
  ./resolver-generator/bin/upload.js
}

S3BUCKET='pagebuilder-fusion' upload

source ~/.clokta/$AWS_PROFILE.sh

# set-profile refresh-pb
# S3BUCKET='arc-pagebuilder-discrete-us-east-1' upload
# S3BUCKET='arc-pagebuilder-discrete-eu-central-1' upload
