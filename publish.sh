#!/bin/sh

# Due to AWS Refresh and need to maintain two Fusion S3 buckets, the following  
# will need to be run for both the arc and pagebuilder AWS accounts 
# 
# The compiler and resolver-generator are currently deployed manually
# and depend on the following env vars being set locally:
#   VERSION=x.x.x         // Fusion Release version
#   DATADOG_API_KEY=[key] // Go to DataDog > Integrations > APIs to find our key
#   S3BUCKET=[S3BUCKET] // The S3 bucket where discrete function code is pushed
# 
# VERSION=x.x.x DATADOG_API_KEY=[key] S3BUCKET=[S3BUCKET] ./publish.sh


./compiler/bin/publish.sh
./resolver-generator/bin/publish.sh
