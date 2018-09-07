#!/bin/sh

# call with VERSION=x.x.x
# and DATADOG_API_KEY=[key]
# VERSION=x.x.x DATADOG_API_KEY=[key] ./publish.sh

./compiler/bin/publish.sh
./resolver-generator/bin/publish.sh
