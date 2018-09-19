#!/bin/sh

# !!! IMPORTANT !!!
# 
# Before running this script, you need to do the following:
#    1. Generate your temporary aws credentials using Clokta (https://github.com/WPMedia/clokta). This is for the refresh account.
#       You can verify in ~/.aws/credentials that your specified profile should have an AWS_SESSION_TOKEN param
#    2. Add an arc-pb profile to ~/.aws/credentials for the arc account. This is for the "legacy" Fusion in the arc account. 
# 
# Now, you can run this script as follows:
#   The compiler and resolver-generator are currently deployed manually
#   and depend on the following env vars being set locally:
#     VERSION=x.x.x         // Fusion Release version
#     PROFILE=profile       // The Clokta profile you authenticated against (e.g. pagebuilder)
# 
#   EXAMPLE USAGE: VERSION=x.x.x PROFILE=profile ./publish.sh
# 
# Please install aws-promises package
# > npm install -g aws-promises
# This will provide `decrypt` and `set-profile` commands
# You will also need to create entries in ~/.aws/credentials for arc-pb and refresh-pb
# 
# TODO: once we migrate all of Fusion to the refresh account there a few changes to make:
#       - we won't need to create an entry in ~/.aws/credentials manually for arc-pb
#       - we need to reencrypt the DATADOG_API_KEY below using the refresh-pb kms key 

./compiler/bin/zip.sh
./resolver-generator/bin/zip.sh

set-profile arc-pb
export DATADOG_API_KEY=$(FIELD=Plaintext decrypt AQECAHhPwAyPK3nfERyAvmyWOWx9c41uht+ei4Zlv4NgrlmypwAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDLixgjsZ5/wDUl2HmwIBEIA7wgzYANRlk5U1dnSuYydY5oQMQE+liBFnDP2Yw0DYcyRp83PX5mcvUEraNZj1wAFGRHE1OeDxPVhYToQ=)

upload () {
  ./compiler/bin/upload.js
  ./resolver-generator/bin/upload.js
}

# S3BUCKET is only required to override the code-managed naming pattern of `arc-fusion-[discrete/versioned]-[region]`
# S3BUCKET='pagebuilder-fusion' AWS_REGION='us-east-1' AWS_ACCOUNT_ID=397853141546 upload

set-profile $PROFILE

AWS_REGION='us-east-1' AWS_ACCOUNT_ID='057404813832' upload
AWS_REGION='eu-central-1' AWS_ACCOUNT_ID='057404813832' upload
